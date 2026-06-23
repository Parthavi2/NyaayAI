from sqlalchemy import Column, DateTime, Integer, String, Text
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
    output_language = Column(String(20))
    fingerprint = Column(String(64), index=True, unique=True)
    extracted_fields_json = Column(Text)
    deadlines_json = Column(Text)
    next_steps_json = Column(Text)
    support_context_json = Column(Text)
    summary = Column(Text)
    explanation = Column(Text)
    reply_draft = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
