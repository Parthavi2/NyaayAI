from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.pipeline import run_pipeline
from app.db.crud import build_analysis_payload, build_case_context_from_record, create_or_update_result, get_by_fingerprint
from app.models.schemas import (
    AnalysisTranslateRequest,
    AnalyzeResponse,
    CaseAssistantRequest,
    CaseAssistantResponse,
    SupportOptions,
    SupportRequest,
    SupportResponse,
)
from app.services.legal_aid_service import get_legal_aid_recommendation, get_support_options
from app.services.llm_service import generate_case_assistant_answer, translate_case_analysis
from app.services.resource_service import resolve_location_and_resources
from app.services.translation_service import get_supported_languages, normalize_output_language
from app.services.whatsapp_service import build_support_message, send_whatsapp_message

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "NyaayAI"}


@router.get("/languages")
def get_languages():
    return {"supported_languages": get_supported_languages()}


@router.post("/analyze-document", response_model=AnalyzeResponse)
async def analyze_document(
    file: UploadFile = File(...),
    output_language: str = Form("en"),
    db: Session = Depends(get_db),
):
    try:
        result = await run_pipeline(file=file, output_language=output_language)
        create_or_update_result(db, build_analysis_payload(result.model_dump()))
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/case-assistant", response_model=CaseAssistantResponse)
async def case_assistant(request: CaseAssistantRequest, db: Session = Depends(get_db)):
    case_context = request.case_context or {}
    source = "request"

    if request.fingerprint:
        record = get_by_fingerprint(db, request.fingerprint)
        if not record and not case_context:
            raise HTTPException(status_code=404, detail="No saved case context found for this fingerprint.")
        if record:
            case_context = build_case_context_from_record(record)
            source = "stored_case_context"

    if not case_context:
        raise HTTPException(status_code=400, detail="Provide a fingerprint or case_context.")

    normalized_output_language = normalize_output_language(request.output_language)
    support_options = get_support_options(
        preferred_language=normalized_output_language,
        case_type=case_context.get("case_type", ""),
        risk_label=case_context.get("risk_label", ""),
        document_type=case_context.get("document_type", ""),
        detected_laws=case_context.get("detected_laws", []),
    )
    answer = await generate_case_assistant_answer(
        question=request.question,
        case_context=case_context,
        output_language=normalized_output_language,
    )
    return CaseAssistantResponse(
        answer=answer,
        output_language=normalized_output_language,
        source=source,
        support_options=SupportOptions(**support_options),
    )


@router.post("/analysis/translate")
async def translate_analysis(request: AnalysisTranslateRequest, db: Session = Depends(get_db)):
    record = get_by_fingerprint(db, request.fingerprint)
    if not record:
        raise HTTPException(status_code=404, detail="No saved case context found for this fingerprint.")

    case_context = build_case_context_from_record(record)
    translated = await translate_case_analysis(case_context, request.output_language)
    return {
        "fingerprint": request.fingerprint,
        "output_language": normalize_output_language(request.output_language),
        "translated": translated,
    }


@router.get("/support/options")
def support_options(
    fingerprint: Optional[str] = Query(default=None),
    state: str = Query(default=""),
    city: str = Query(default=""),
    latitude: Optional[float] = Query(default=None),
    longitude: Optional[float] = Query(default=None),
    preferred_language: str = Query(default="en"),
    case_type: str = Query(default=""),
    db: Session = Depends(get_db),
):
    normalized_output_language = normalize_output_language(preferred_language)
    stored_case_type = case_type
    record = None
    stored_case_context = {}
    if fingerprint:
        record = get_by_fingerprint(db, fingerprint)
        if record:
            stored_case_type = stored_case_type or record.case_type
            stored_case_context = build_case_context_from_record(record)

    legal_aid = get_legal_aid_recommendation(
        state=state,
        city=city,
        latitude=latitude,
        longitude=longitude,
        preferred_language=normalized_output_language,
        case_type=stored_case_type,
        risk_label=record.risk_label if fingerprint and record else "",
        document_type=record.document_type if fingerprint and record else "",
        detected_laws=stored_case_context.get("detected_laws", []),
    )
    support = get_support_options(
        state=state,
        city=city,
        latitude=latitude,
        longitude=longitude,
        preferred_language=normalized_output_language,
        case_type=stored_case_type,
        risk_label=record.risk_label if fingerprint and record else "",
        document_type=record.document_type if fingerprint and record else "",
        detected_laws=stored_case_context.get("detected_laws", []),
    )
    resources = resolve_location_and_resources(
        state=state,
        city=city,
        latitude=latitude,
        longitude=longitude,
        case_type=stored_case_type,
        risk_label=record.risk_label if fingerprint and record else "",
        document_type=record.document_type if fingerprint and record else "",
        detected_laws=stored_case_context.get("detected_laws", []),
    )
    return {
        "preferred_language": normalized_output_language,
        "detected_state": resources["state_detected"],
        "detected_city": resources["city_detected"],
        "state_options": resources.get("state_options", []),
        "resources": resources["resources"],
        "legal_aid": legal_aid,
        "support_options": support,
    }


@router.post("/support/escalate", response_model=SupportResponse)
def escalate_support(request: SupportRequest, db: Session = Depends(get_db)):
    normalized_output_language = normalize_output_language(request.preferred_language)
    case_context = {}
    if request.fingerprint:
        record = get_by_fingerprint(db, request.fingerprint)
        if record:
            case_context = build_case_context_from_record(record)

    case_type = request.case_type or case_context.get("case_type", "")
    resources = resolve_location_and_resources(
        state=request.state,
        city=request.city,
        latitude=request.latitude,
        longitude=request.longitude,
        case_type=case_type,
        risk_label=case_context.get("risk_label", ""),
        document_type=case_context.get("document_type", ""),
        detected_laws=case_context.get("detected_laws", []),
    )
    legal_aid = get_legal_aid_recommendation(
        state=request.state,
        city=request.city,
        latitude=request.latitude,
        longitude=request.longitude,
        preferred_language=normalized_output_language,
        case_type=case_type,
        risk_label=case_context.get("risk_label", ""),
        document_type=case_context.get("document_type", ""),
        detected_laws=case_context.get("detected_laws", []),
    )
    support = get_support_options(
        state=request.state,
        city=request.city,
        latitude=request.latitude,
        longitude=request.longitude,
        preferred_language=normalized_output_language,
        case_type=case_type,
        risk_label=case_context.get("risk_label", ""),
        document_type=case_context.get("document_type", ""),
        detected_laws=case_context.get("detected_laws", []),
    )

    escalation_summary = build_support_message(request.message, case_context)
    whatsapp_result = {"success": False, "message": "Phone number not provided."}
    if request.phone_number:
        whatsapp_result = send_whatsapp_message(request.phone_number, escalation_summary)

    return SupportResponse(
        success=True,
        message="Support options prepared successfully.",
        detected_state=resources["state_detected"],
        detected_city=resources["city_detected"],
        state_options=resources.get("state_options", []),
        whatsapp=whatsapp_result,
        legal_aid=legal_aid,
        helplines=[item for item in support["helplines"]],
        resources=resources["resources"],
        escalation_summary=escalation_summary,
    )
