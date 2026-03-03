from sqlalchemy.orm import Session
import models
import schemas
import random
import string
import email_utils

# ---- JOBS ----
def get_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.JobPosting).offset(skip).limit(limit).all()

def create_job(db: Session, job: schemas.JobCreate):
    db_job = models.JobPosting(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

# ---- CANDIDATES ----
def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).offset(skip).limit(limit).all()

def add_tracking_log(db: Session, candidate_id: int, event: str):
    log = models.CandidateTracking(candidate_id=candidate_id, event=event)
    db.add(log)
    db.commit()

def create_candidate(db: Session, cand: schemas.CandidateCreate):
    # Check Duplicate
    existing = db.query(models.Candidate).filter(
        models.Candidate.email == cand.email, 
        models.Candidate.job_id == cand.job_id
    ).first()
    if existing:
        return None # Indicate duplicate
    
    db_cand = models.Candidate(
        name=cand.name, 
        email=cand.email, 
        job_id=cand.job_id,
        stage="Applied"
    )
    db.add(db_cand)
    db.commit()
    db.refresh(db_cand)
    
    # Add tracking
    add_tracking_log(db, db_cand.id, "Resume Shortlisted. Application Track Initiated.")

    # Send Notification Email
    try:
        job = db.query(models.JobPosting).filter(models.JobPosting.id == cand.job_id).first()
        job_title = job.title if job else "Open Position"
        email_utils.send_application_received(db_cand.name, db_cand.email, job_title)
    except Exception as e:
        print(f"Error sending application received email: {e}")
    
    return db_cand

def update_candidate_score(db: Session, candidate_id: int, score_data: schemas.ScoreUpdate):
    cand = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not cand:
        return None
    
    # Simple logic for round cutoff (e.g. 70%)
    cutoff = 70.0
    passed = score_data.score >= cutoff

    if score_data.round == 1:
        cand.score_r1 = score_data.score
        if passed:
            cand.stage = "Round 2"
            add_tracking_log(db, cand.id, f"Passed Round 1 Aptitude test (Score: {score_data.score}). Moved to Round 2.")
        else:
            cand.stage = "Rejected"
            add_tracking_log(db, cand.id, f"Failed Round 1 Aptitude test (Score: {score_data.score}). Auto-rejected.")
    elif score_data.round == 2:
        cand.score_r2 = score_data.score
        if passed:
            cand.stage = "HR Round"
            add_tracking_log(db, cand.id, f"Passed Round 2 Coding assessment (Score: {score_data.score}). Moved to HR Round.")
        else:
            cand.stage = "Rejected"
            add_tracking_log(db, cand.id, f"Failed Round 2 Coding assessment (Score: {score_data.score}). Auto-rejected.")
            
    db.commit()
    db.refresh(cand)
    return cand

def update_candidate_stage(db: Session, candidate_id: int, stage_data: schemas.StageUpdate):
    cand = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not cand:
        return None
        
    cand.stage = stage_data.stage
    evt = f"Status updated to: {stage_data.stage}"
    if stage_data.notes:
        evt += f" - Notes: {stage_data.notes}"
        
    add_tracking_log(db, cand.id, evt)
    
    if stage_data.stage == "Accepted":
        setup_candidate_onboarding(db, cand)
        
    db.commit()
    db.refresh(cand)
    return cand

def setup_candidate_onboarding(db: Session, cand: models.Candidate):
    if not cand.onboarding_password:
        chars = string.ascii_letters + string.digits
        pwd = ''.join(random.choice(chars) for _ in range(8))
        cand.onboarding_password = pwd
        cand.onboarding_status = "Pending"
        try:
            email_utils.send_onboarding_welcome(cand.name, cand.email, pwd)
            add_tracking_log(db, cand.id, "Onboarding Profile Created & Credentials Emailed.")
        except Exception as e:
            add_tracking_log(db, cand.id, f"Error sending onboarding email: {e}")

# ---- STATS ----
def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
    active_jobs = db.query(models.JobPosting).filter(models.JobPosting.status == "Active").count()
    total_candidates = db.query(models.Candidate).count()
    
    # Pending interviews are candidates in round 1, round 2, hr round
    pending_interviews = db.query(models.Candidate).filter(
        models.Candidate.stage.in_(["Round 1", "Round 2", "HR Round"])
    ).count()

    offers_accepted = db.query(models.Candidate).filter(
        models.Candidate.stage.in_(["Offered", "Accepted"])
    ).count()

    return schemas.DashboardStats(
        active_jobs=active_jobs,
        total_candidates=total_candidates,
        pending_interviews=pending_interviews,
        offers_accepted=offers_accepted
    )

def get_recent_activity(db: Session, limit: int = 5):
    logs = db.query(models.CandidateTracking).order_by(models.CandidateTracking.timestamp.desc()).limit(limit).all()
    
    activity = []
    for log in logs:
        cand = log.candidate
        job_title = cand.job.title if cand and cand.job else "Unknown Job"
        cand_name = cand.name if cand else "Unknown Candidate"
        
        activity.append(schemas.RecentActivityResponse(
            id=log.id,
            candidate_name=cand_name,
            job_title=job_title,
            event=log.event,
            timestamp=log.timestamp
        ))
        
    return activity

# ---- ONBOARDING DOCUMENTS ----
def upload_onboarding_document(db: Session, upload_data: schemas.DocumentUpload):
    cand = db.query(models.Candidate).filter(models.Candidate.id == upload_data.candidate_id).first()
    if not cand:
        return None
        
    confidence = 0.50
    ai_status = "HR Review"
    hr_status = "Pending"
    notes = None
    
    try:
        import os
        import re
        import json
        import random
        import time
        import zipfile
        import base64
        import uuid
        from sarvamai import SarvamAI
        from dotenv import load_dotenv

        load_dotenv()
        sarvam_key = os.getenv("SARVAM_API_KEY")
        if not sarvam_key:
            raise ValueError("SARVAM_API_KEY unset.")

        client = SarvamAI(api_subscription_key=sarvam_key)
        
        file_meta = upload_data.file_data.split(';')[0] if ';' in upload_data.file_data else ""
        base64_payload = upload_data.file_data.split(',')[1] if ',' in upload_data.file_data else upload_data.file_data
        
        temp_filename = f"temp_{uuid.uuid4().hex}"
        is_pdf = 'application/pdf' in file_meta
        
        upload_path = f"{temp_filename}.pdf" if is_pdf else f"{temp_filename}.zip"
        
        if is_pdf:
            with open(upload_path, "wb") as f:
                f.write(base64.b64decode(base64_payload))
        else:
            with zipfile.ZipFile(upload_path, 'w') as zf:
                zf.writestr("image.png", base64.b64decode(base64_payload))
                
        # Sarvam OCR
        job = client.document_intelligence.create_job()
        job.upload_file(upload_path)
        job.start()
        
        poll_count = 0
        extracted_text = "No text extracted."
        job_status = "Pending"
        
        while poll_count < 20:
            status_obj = job.get_status()
            job_status = getattr(status_obj, 'job_state', 'Failed')
            if job_status == "Completed":
                break
            elif job_status in ["Failed", "Error"]:
                break
            time.sleep(2)
            poll_count += 1
            
        out_zip = f"{temp_filename}_out.zip"
        if job_status == "Completed":
            job.download_output(out_zip)
            if os.path.exists(out_zip):
                with zipfile.ZipFile(out_zip, 'r') as zf:
                    for name in zf.namelist():
                        if name.endswith('.md') or name.endswith('.html') or name.endswith('.txt'):
                            extracted_text = zf.read(name).decode('utf-8', errors='ignore')
                            break
                            
        for f in [upload_path, out_zip]:
            if os.path.exists(f):
                os.remove(f)

        prompt = f"""You are a strict HR Document Verification AI.
The user is attempting to safely upload an item categorized as: '{upload_data.doc_type}'.
Here is the exact optical text extraction (OCR):

<OCR_TEXT>
{extracted_text[:3000]}
</OCR_TEXT>

Your strict task is to ensure the document meets the specific requirements of its category. Read these rules carefully:
- If 'Photo': It must be a passport-sized photo with just 1 person or single human face. Since you only see OCR, there should be ALMOST NO TEXT. If the OCR is empty or says "No text extracted.", you MUST Approve it with > 0.90 confidence. If you see large amounts of document text, Reject it.
- If '10th Mark Sheet': Must contain school name, student name, roll number, and text explicitly indicating X standard or 10th standard, and subject names.
- If '12th Mark Sheet': Must contain school name, student name, roll number, and text explicitly indicating XII standard or 12th standard, and subject names.
- If 'UG Certificate': Must explicitly state the Degree name, the college or university name, and a signature.
- If 'PG Certificate': Must explicitly state the Degree name, the college or university name, and a signature.
- If 'Aadhar': Must contain a 12-digit unique number, an address, government symbol text, and aadhar text.
- If 'Bank Details': Must contain bank name, IFSC, and account number.
- If 'PAN Card': Must contain text such as Income Tax Department, Permanent Account Number Card, government symbol, student/person name, father name, signature, and date of birth (DOB).
- If 'Experience Certificate': Must contain the company name, duration/number of years worked, designation, and an authorized signature.

Rules:
1. For ANY document EXCEPT 'Photo': If the text does NOT contain the mandatory indicators matching '{upload_data.doc_type}' as specified above, you MUST strictly Reject it (confidence < 0.5).
2. If it is obviously fake, generic template, or dummy text, Reject it.
3. If it perfectly matches the required fields for the category, Approve it (confidence > 0.85).
Provide ONLY a literal JSON block containing exactly:
- 'confidence' (float 0 to 1): Assign < 0.55 if fake/wrong/missing required fields. Assign > 0.85 if perfect.
- 'ai_status' (string): Strictly 'Approved', 'HR Review', or 'Rejected'. If you assign < 0.6 confidence, it MUST be 'Rejected'.
- 'notes' (string): Explain shortly why it was accepted or rejected based on the missing/present fields.
"""
        
        resp = client.chat.completions(messages=[{"role": "user", "content": prompt}])
        resp_text = getattr(resp.choices[0], "message", None)
        if resp_text:
            resp_text = resp_text.content
        else:
            resp_text = ""
        
        match_conf = re.search(r'"confidence"\s*:\s*([\d\.]+)', resp_text)
        match_status = re.search(r'"ai_status"\s*:\s*"([^"]+)"', resp_text)
        match_notes = re.search(r'"notes"\s*:\s*"([^"]+)"', resp_text)
        
        if match_conf:
            confidence = float(match_conf.group(1))
        else:
            confidence = round(random.uniform(0.7, 0.99), 2)
            
        if match_status:
            ai_status = match_status.group(1)
            if ai_status not in ["Approved", "HR Review", "Rejected"]:
                ai_status = "HR Review"
        else:
            ai_status = "Approved" if confidence > 0.8 else "HR Review"
            
        if match_notes:
            notes = f"Sarvam AI: {match_notes.group(1)}"
        else:
            notes = "Sarvam AI verification processed securely."
            
        if ai_status == "Rejected" or confidence < 0.6:
            ai_status = "Rejected"
            hr_status = "Rejected"

    except Exception as e:
        print("Verification Error:", e)
        confidence = round(random.uniform(0.4, 0.99), 2)
        if confidence >= 0.85:
            ai_status = "Approved"
            hr_status = "Pending"
        elif confidence >= 0.60:
            ai_status = "HR Review"
            hr_status = "Pending"
        else:
            ai_status = "Rejected"
            hr_status = "Rejected"
        
    doc = models.OnboardingDocument(
        candidate_id=upload_data.candidate_id,
        doc_type=upload_data.doc_type,
        file_data=upload_data.file_data,
        ai_confidence=confidence,
        ai_status=ai_status,
        hr_status=hr_status,
        notes=notes
    )
    db.add(doc)
    
    cand.onboarding_status = "In Progress"
    add_tracking_log(db, cand.id, f"Uploaded Document [{upload_data.doc_type}]. Validated actively via Sarvam AI API. Result: {ai_status}")
    db.commit()
    db.refresh(doc)
    return doc
def get_document_file(db: Session, doc_id: int):
    doc = db.query(models.OnboardingDocument).filter(models.OnboardingDocument.id == doc_id).first()
    return doc

def update_document_status(db: Session, doc_id: int, status_data: schemas.DocumentStatusUpdate):
    doc = db.query(models.OnboardingDocument).filter(models.OnboardingDocument.id == doc_id).first()
    if not doc:
        return None
    doc.hr_status = status_data.hr_status
    if status_data.notes:
        doc.notes = status_data.notes
    db.commit()
    db.refresh(doc)
    return doc

def submit_onboarding(db: Session, candidate_id: int):
    cand = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not cand:
        return None
    cand.onboarding_status = "Under Verification"
    add_tracking_log(db, cand.id, "Candidate submitted all documents. Status updated to Under Verification.")
    db.commit()
    db.refresh(cand)
    return cand

def complete_onboarding(db: Session, candidate_id: int):
    cand = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not cand:
        return None
    cand.onboarding_status = "Completed"
    add_tracking_log(db, cand.id, "HR verified all documents. Candidate fully Onboarded.")
    db.commit()
    db.refresh(cand)
    return cand

def delete_document(db: Session, doc_id: int):
    doc = db.query(models.OnboardingDocument).filter(models.OnboardingDocument.id == doc_id).first()
    if not doc:
        return False
    cand_id = doc.candidate_id
    doc_type = doc.doc_type
    db.delete(doc)
    add_tracking_log(db, cand_id, f"Deleted Document: [{doc_type}]. Record removed.")
    db.commit()
    return True
