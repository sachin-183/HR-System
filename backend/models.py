from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class HRUser(Base):
    __tablename__ = "hr_users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class JobPosting(Base):
    __tablename__ = "job_postings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    department = Column(String)
    skills = Column(String)
    status = Column(String, default="Active")
    description = Column(String, nullable=True)
    responsibilities = Column(String, nullable=True)
    qualifications = Column(String, nullable=True)
    preferred_qualifications = Column(String, nullable=True)
    what_we_offer = Column(String, nullable=True)
    job_category = Column(String, nullable=True)
    job_type = Column(String, nullable=True)
    job_location = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    candidates = relationship("Candidate", back_populates="job")

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id"))
    name = Column(String, index=True)
    email = Column(String, index=True)
    resume_url = Column(String, nullable=True)
    stage = Column(String, default="Applied") # Stages: Applied, Round 1, Round 2, HR Round, Offered, Rejected
    score_r1 = Column(Float, nullable=True)
    score_r2 = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    onboarding_password = Column(String, nullable=True) # Plain text for simulated sending/login
    onboarding_status = Column(String, default="Pending") # Pending, In Progress, Completed
    
    job = relationship("JobPosting", back_populates="candidates")
    tracking_logs = relationship("CandidateTracking", back_populates="candidate", cascade="all, delete")
    documents = relationship("OnboardingDocument", back_populates="candidate", cascade="all, delete")

class CandidateTracking(Base):
    __tablename__ = "candidate_tracking"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    event = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="tracking_logs")

class OnboardingDocument(Base):
    __tablename__ = "onboarding_documents"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    doc_type = Column(String) # Photo, PAN, Aadhar, Degree Certificate, Experience Letter, Bank Details
    file_data = Column(String) # Base64 encoded payload
    ai_confidence = Column(Float, nullable=True) # Confidence score 0.0 - 1.0
    ai_status = Column(String, default="Pending") # Auto Approved, HR Review, Rejected
    hr_status = Column(String, default="Pending") # Approved, Rejected, Pending
    notes = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="documents")
