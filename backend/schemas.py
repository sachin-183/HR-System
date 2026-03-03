from pydantic import BaseModel
from typing import List, Optional
import datetime

# --- JOBS ---
class JobBase(BaseModel):
    title: str
    department: str
    skills: str
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    qualifications: Optional[str] = None
    preferred_qualifications: Optional[str] = None
    what_we_offer: Optional[str] = None
    job_category: Optional[str] = None
    job_type: Optional[str] = None
    job_location: Optional[str] = None
    end_date: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    status: str
    class Config:
        from_attributes = True

# --- TRACKING ---
class TrackingBase(BaseModel):
    event: str

class TrackingResponse(TrackingBase):
    id: int
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

class RecentActivityResponse(BaseModel):
    id: int
    candidate_name: str
    job_title: str
    event: str
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

# --- CANDIDATE ---
class CandidateBase(BaseModel):
    name: str
    email: str
    job_id: int

class OnboardingDocumentResponse(BaseModel):
    id: int
    doc_type: str
    ai_confidence: Optional[float] = None
    ai_status: str
    hr_status: str
    notes: Optional[str] = None
    uploaded_at: datetime.datetime
    
    class Config:
        from_attributes = True

class DocumentUpload(BaseModel):
    candidate_id: int
    doc_type: str
    file_data: str

class DocumentStatusUpdate(BaseModel):
    hr_status: str
    notes: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    stage: str
    score_r1: Optional[float] = None
    score_r2: Optional[float] = None
    created_at: datetime.datetime
    onboarding_status: str
    onboarding_password: Optional[str] = None
    tracking_logs: List[TrackingResponse] = []
    documents: List[OnboardingDocumentResponse] = []

    class Config:
        from_attributes = True

class ScoreUpdate(BaseModel):
    round: int
    score: float

class StageUpdate(BaseModel):
    stage: str
    notes: Optional[str] = ""

# --- DASHBOARD STATS ---
class DashboardStats(BaseModel):
    active_jobs: int
    total_candidates: int
    pending_interviews: int
    offers_accepted: int

# --- EMAIL ---
class EmailSchema(BaseModel):
    to_email: str
    subject: str
    body: str

class ReplyPayload(BaseModel):
    candidate_id: int
    base64_reply: str

