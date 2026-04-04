from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.database import Base
 
 
class AnalysisResult(Base):
    __tablename__ = "analysis_results"
 
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(100))
    case_type = Column(String(100))
    risk_label = Column(String(50))
    risk_score = Column(Integer)
    detected_language = Column(String(20))
    fingerprint = Column(String(64), index=True)
    summary = Column(Text)
    explanation = Column(Text)
    reply_draft = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
 