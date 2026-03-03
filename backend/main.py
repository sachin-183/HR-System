from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import base64
import models
import schemas
import crud
import email_utils
from database import SessionLocal, engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart HR Recruitment API")

# Setup CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Smart HR System API is running"}

# --- JOBS ---
@app.get("/api/jobs", response_model=List[schemas.JobResponse])
def get_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_jobs(db, skip=skip, limit=limit)

@app.post("/api/jobs", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    return crud.create_job(db, job)

# --- CANDIDATES ---
@app.get("/api/candidates", response_model=List[schemas.CandidateResponse])
def get_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_candidates(db, skip=skip, limit=limit)

@app.post("/api/candidates", response_model=schemas.CandidateResponse)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    db_cand = crud.create_candidate(db, candidate)
    if not db_cand:
        raise HTTPException(status_code=400, detail="Duplicate Candidate Application detected.")
    return db_cand

@app.patch("/api/candidates/{candidate_id}/score", response_model=schemas.CandidateResponse)
def update_score(candidate_id: int, score_data: schemas.ScoreUpdate, db: Session = Depends(get_db)):
    db_cand = crud.update_candidate_score(db, candidate_id, score_data)
    if not db_cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    if db_cand.stage == "Rejected":
        try:
            job_title = db_cand.job.title if db_cand.job else "the position"
            body = email_utils.create_rejection_letter(db_cand.name, job_title)
            email_utils.send_email(db_cand.email, f"Update on your application for {job_title}", body)
        except Exception as e:
            print("Failed sending auto-rejection email:", e)
            
    return db_cand

@app.patch("/api/candidates/{candidate_id}/stage", response_model=schemas.CandidateResponse)
def update_stage(candidate_id: int, stage_data: schemas.StageUpdate, db: Session = Depends(get_db)):
    db_cand = crud.update_candidate_stage(db, candidate_id, stage_data)
    if not db_cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    try:
        job_title = db_cand.job.title if db_cand.job else "the position"
        if stage_data.stage == "Offered":
            body = email_utils.create_offer_letter_text(db_cand.name, job_title)
            pdf_bytes = email_utils.generate_shellkode_offer_pdf(db_cand.name, job_title)
            email_utils.send_email(
                to_email=db_cand.email, 
                subject="Official Offer Letter - Action Required", 
                message_body=body,
                attachment=pdf_bytes,
                attachment_name=f"ShellKode_Offer_{db_cand.name.replace(' ', '_')}.pdf"
            )
            crud.add_tracking_log(db, db_cand.id, "Automated Offer Email sent to candidate.")
        elif stage_data.stage == "Rejected":
            body = email_utils.create_rejection_letter(db_cand.name, job_title)
            email_utils.send_email(db_cand.email, f"Update on your application for {job_title}", body)
            crud.add_tracking_log(db, db_cand.id, "Automated Rejection Email sent to candidate.")
    except Exception as e:
        print("Failed sending auto-email on stage update:", e)

    return db_cand

# --- STATS ---
@app.get("/api/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)

@app.get("/api/activity", response_model=List[schemas.RecentActivityResponse])
def get_activity(limit: int = 5, db: Session = Depends(get_db)):
    return crud.get_recent_activity(db, limit)

# --- ONBOARDING ENDPOINTS ---
from pydantic import BaseModel
class OnboardingLogin(BaseModel):
    email: str
    password: str

@app.post("/api/onboarding/login")
def onboarding_login(creds: OnboardingLogin, db: Session = Depends(get_db)):
    cand = db.query(models.Candidate).filter(models.Candidate.email == creds.email).first()
    if not cand or cand.onboarding_password != creds.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"status": "success", "candidate_id": cand.id, "name": cand.name}

@app.post("/api/documents/upload", response_model=schemas.OnboardingDocumentResponse)
def upload_document(doc_data: schemas.DocumentUpload, db: Session = Depends(get_db)):
    doc = crud.upload_onboarding_document(db, doc_data)
    if not doc:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return doc

@app.patch("/api/documents/{doc_id}/status", response_model=schemas.OnboardingDocumentResponse)
def update_doc_status(doc_id: int, status_data: schemas.DocumentStatusUpdate, db: Session = Depends(get_db)):
    doc = crud.update_document_status(db, doc_id, status_data)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.get("/api/documents/{doc_id}/file")
def get_document_file_data(doc_id: int, db: Session = Depends(get_db)):
    doc = crud.get_document_file(db, doc_id)
    if not doc or not doc.file_data:
        raise HTTPException(status_code=404, detail="Document file not found")
    return {"file_data": doc.file_data}

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    success = crud.delete_document(db, doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success", "message": "Document deleted"}

@app.post("/api/candidates/{candidate_id}/submit_onboarding", response_model=schemas.CandidateResponse)
def submit_onboarding_api(candidate_id: int, db: Session = Depends(get_db)):
    cand = crud.submit_onboarding(db, candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return cand

@app.post("/api/candidates/{candidate_id}/complete_onboarding", response_model=schemas.CandidateResponse)
def complete_onboarding_api(candidate_id: int, db: Session = Depends(get_db)):
    cand = crud.complete_onboarding(db, candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    try:
        email_utils.send_onboarding_completed(cand.name, cand.email)
    except Exception as e:
        print(f"Failed to send completion email to {cand.email}: {e}")
    return cand

# --- EMAIL ---
@app.post("/api/email/send")
def send_email_api(payload: schemas.EmailSchema, db: Session = Depends(get_db)):
    try:
        # Fallback for cached frontends trying to send the old manual Offer letter
        if "Offer Letter" in payload.subject:
            # We don't have candidate_id in the payload, so we extract from email
            cand = db.query(models.Candidate).filter(models.Candidate.email == payload.to_email).first()
            if cand:
                job_title = cand.job.title if cand.job else "the position"
                pdf_bytes = email_utils.generate_shellkode_offer_pdf(cand.name, job_title)
                body = email_utils.create_offer_letter_text(cand.name, job_title)
                email_utils.send_email(
                    to_email=payload.to_email,
                    subject="Official Offer Letter - Action Required",
                    message_body=body,
                    attachment=pdf_bytes,
                    attachment_name=f"ShellKode_Offer_{cand.name.replace(' ', '_')}.pdf"
                )
                return {"status": "success", "message": "Email sent with PDF Override"}
        
        # Standard fallback for other manual emails
        email_utils.send_email(payload.to_email, payload.subject, payload.body)
        return {"status": "success", "message": "Email sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/email/process_reply")
def process_email_reply(payload: schemas.ReplyPayload, db: Session = Depends(get_db)):
    cand = db.query(models.Candidate).filter(models.Candidate.id == payload.candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    try:
        # User specified checking return mail using Base64 AI text extract
        decoded_bytes = base64.b64decode(payload.base64_reply)
        decoded_text = decoded_bytes.decode('utf-8').lower()
        
        import re
        
        # Simulated AI Sentiment / Keyword extraction
        positive_keywords = ["accept", "yes", "positive", "confirm", "joining", "excited"]
        negative_keywords = ["reject", "decline", "no", "apologize", "unfortunately", "not joining"]
        
        is_positive = any(re.search(rf"\b{word}\b", decoded_text) for word in positive_keywords)
        is_negative = any(re.search(rf"\b{word}\b", decoded_text) for word in negative_keywords)
        
        # Decide based on AI extraction
        if is_positive and not is_negative:
            cand.stage = "Accepted"
            crud.add_tracking_log(db, cand.id, "AI Analysis: Offer Reply Evaluated as POSITIVE. Candidate Accepted.")
            crud.setup_candidate_onboarding(db, cand)
        else:
            cand.stage = "Rejected"
            crud.add_tracking_log(db, cand.id, "AI Analysis: Offer Reply Evaluated as REJECTED or DECLINED.")
            
        db.commit()
        db.refresh(cand)
        return {"status": "success", "ai_extract": decoded_text, "new_stage": cand.stage}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process Base64 reply: {e}")

# --- STARTUP HOOKS ---
import threading
import time
import imap_worker

def start_imap_polling():
    while True:
        try:
            imap_worker.check_inbox_for_replies()
        except:
            pass
        time.sleep(10) # 10 seconds checking loop

@app.on_event("startup")
async def startup_event():
    print("Starting automatic IMAP Inbox polling thread...")
    threading.Thread(target=start_imap_polling, daemon=True).start()

