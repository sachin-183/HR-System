import os
import imaplib
import email
from email.header import decode_header
import re
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import crud
from dotenv import load_dotenv

load_dotenv()

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def get_text_from_email(msg):
    text = ""
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            cdispo = str(part.get('Content-Disposition'))
            if ctype == 'text/plain' and 'attachment' not in cdispo:
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        text += payload.decode(errors='ignore')
                except Exception:
                    pass
    else:
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                text = payload.decode(errors='ignore')
        except Exception:
            pass
    return text

def check_inbox_for_replies():
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        return
    
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(SMTP_USERNAME, SMTP_PASSWORD)
        mail.select('inbox')
        
        # Search for all unread emails
        status, messages = mail.search(None, 'UNSEEN')
        if status != "OK" or not messages[0]:
            mail.close()
            mail.logout()
            return
            
        db = SessionLocal()
        try:
            for num in messages[0].split():
                res, msg_data = mail.fetch(num, '(RFC822)')
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        
                        from_header_encoded = msg.get("From", "")
                        if not from_header_encoded:
                            continue
                            
                        from_header, encoding = decode_header(from_header_encoded)[0]
                        if isinstance(from_header, bytes):
                            from_header = from_header.decode(encoding or 'utf-8', errors='ignore')
                        
                        # Extract exact email address
                        match = re.search(r'[\w\.-]+@[\w\.-]+', from_header)
                        sender_email = match.group(0).lower() if match else from_header.strip().lower()
                        
                        body_text = get_text_from_email(msg).lower()
                        print(f"[IMAP] Checking UNSEEN email from: {sender_email}")
                        
                        # Match candidate in "Offered" stage
                        cands = db.query(models.Candidate).filter(models.Candidate.stage == "Offered").all()
                        for cand in cands:
                            if cand.email.lower() == sender_email:
                                # AI extraction proxy
                                positive_keywords = ["accept", "yes", "positive", "confirm", "joining", "excited", "happy", "glad"]
                                negative_keywords = ["reject", "decline", "no", "apologize", "unfortunately", "not joining", "cannot"]
                                
                                is_positive = any(re.search(rf"\b{word}\b", body_text) for word in positive_keywords)
                                is_negative = any(re.search(rf"\b{word}\b", body_text) for word in negative_keywords)
                                
                                if is_positive and not is_negative:
                                    cand.stage = "Accepted"
                                    crud.add_tracking_log(db, cand.id, "AI Analysis via Inbox: Positive reply directly detected! Candidate Accepted.")
                                    crud.setup_candidate_onboarding(db, cand)
                                else:
                                    cand.stage = "Rejected"
                                    crud.add_tracking_log(db, cand.id, "AI Analysis via Inbox: Email evaluated as REJECTED or DECLINED.")
                                
                                db.commit()
                                print(f"[IMAP AI] Successfully moved {cand.name} to {cand.stage} based on direct inbox read.")
        finally:
            db.close()
            mail.close()
            mail.logout()
            
    except Exception as e:
        print(f"[IMAP ERROR] Checking inbox failed: {e}")
