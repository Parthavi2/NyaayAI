from sqlalchemy.orm import Session
from app.models.db_models import AnalysisResult
 
 
def create_result(db: Session, payload: dict):
    obj = AnalysisResult(**payload)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
 
 
def get_all_results(db: Session, limit: int = 50):
    return db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(limit).all()
 
 
def get_by_fingerprint(db: Session, fingerprint: str):
    return db.query(AnalysisResult).filter(AnalysisResult.fingerprint == fingerprint).first()
 