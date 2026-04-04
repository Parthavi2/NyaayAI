from typing import Dict, List
from pydantic import BaseModel
 
 
class AnalyzeResponse(BaseModel):
    detected_language: str
    redactions: List[str]
    document_type: str
    case_type: str
    tone: str
    extracted_fields: Dict
    risk_score: int
    risk_label: str
    risk_reasons: List[str]
    deadlines: List[str]
    next_steps: List[str]
    summary: str
    explanation: str
    reply_draft: str
    fingerprint: str
 