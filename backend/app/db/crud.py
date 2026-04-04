import json

from sqlalchemy.orm import Session

from app.models.db_models import AnalysisResult


def create_or_update_result(db: Session, payload: dict):
    existing = get_by_fingerprint(db, payload["fingerprint"])
    if existing:
        for key, value in payload.items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing

    obj = AnalysisResult(**payload)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_all_results(db: Session, limit: int = 50):
    return db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(limit).all()


def get_by_fingerprint(db: Session, fingerprint: str):
    return db.query(AnalysisResult).filter(AnalysisResult.fingerprint == fingerprint).first()


def build_analysis_payload(result: dict) -> dict:
    return {
        "document_type": result["document_type"],
        "case_type": result["case_type"],
        "risk_label": result["risk_label"],
        "risk_score": result["risk_score"],
        "detected_language": result["detected_language"],
        "output_language": result["output_language"],
        "fingerprint": result["fingerprint"],
        "extracted_fields_json": json.dumps(result["extracted_fields"], ensure_ascii=False),
        "deadlines_json": json.dumps(result.get("deadline_items", result.get("deadlines", [])), ensure_ascii=False),
        "next_steps_json": json.dumps(result["next_steps"], ensure_ascii=False),
        "support_context_json": json.dumps(
            {
                "legal_aid": result["legal_aid"],
                "support_options": result["support_options"],
                "notice_details": result.get("notice_details", {}),
                "detected_laws": result.get("detected_laws", []),
                "rights_information": result.get("rights_information", []),
                "state_detected": result.get("state_detected", ""),
                "city_detected": result.get("city_detected", ""),
                "state_options": result.get("state_options", []),
                "location_resources": result.get("location_resources", []),
                "source_text": result.get("source_text", ""),
                "tone": result["tone"],
            },
            ensure_ascii=False,
        ),
        "summary": result["summary"],
        "explanation": result["explanation"],
        "reply_draft": result["reply_draft"],
    }


def build_case_context_from_record(record: AnalysisResult) -> dict:
    support_context = _safe_json_load(record.support_context_json)
    return {
        "document_type": record.document_type,
        "case_type": record.case_type,
        "risk_label": record.risk_label,
        "risk_score": record.risk_score,
        "detected_language": record.detected_language,
        "output_language": record.output_language,
        "fingerprint": record.fingerprint,
        "extracted_fields": _safe_json_load(record.extracted_fields_json),
        "deadline_items": _safe_json_load(record.deadlines_json),
        "deadlines": [item.get("label", "") for item in _safe_json_load(record.deadlines_json) if isinstance(item, dict)],
        "next_steps": _safe_json_load(record.next_steps_json),
        "summary": record.summary,
        "explanation": record.explanation,
        "reply_draft": record.reply_draft,
        "legal_aid": support_context.get("legal_aid", {}),
        "support_options": support_context.get("support_options", {}),
        "notice_details": support_context.get("notice_details", {}),
        "detected_laws": support_context.get("detected_laws", []),
        "rights_information": support_context.get("rights_information", []),
        "state_detected": support_context.get("state_detected", ""),
        "city_detected": support_context.get("city_detected", ""),
        "state_options": support_context.get("state_options", []),
        "location_resources": support_context.get("location_resources", []),
        "source_text": support_context.get("source_text", ""),
        "tone": support_context.get("tone", "neutral"),
    }


def _safe_json_load(value: str):
    try:
        return json.loads(value) if value else {}
    except Exception:
        return {}
