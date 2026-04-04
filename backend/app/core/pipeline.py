from fastapi import UploadFile
from app.core.security import validate_upload, ensure_upload_dir
from app.services.ocr_service import extract_text_from_upload
from app.services.text_cleaner import clean_text
from app.services.language_detector import detect_language
from app.services.redaction_service import redact_pii
from app.services.extraction_service import extract_fields
from app.services.classifier_service import classify_document_and_case
from app.services.fraud_service import detect_fraud_and_score
from app.services.deadline_service import extract_deadlines
from app.services.guidance_service import generate_guidance
from app.services.llm_service import generate_llm_output
from app.services.emotion_service import detect_tone
from app.services.fingerprint_service import fingerprint_text
from app.models.schemas import AnalyzeResponse
 
 
async def run_pipeline(file: UploadFile, output_language: str) -> AnalyzeResponse:
    validate_upload(file)
    ensure_upload_dir()
 
    raw_text = await extract_text_from_upload(file)
    cleaned_text = clean_text(raw_text)
    detected_language = detect_language(cleaned_text)
    sanitized_text, redactions = redact_pii(cleaned_text)
    extracted_fields = extract_fields(sanitized_text)
    doc_meta = classify_document_and_case(sanitized_text, extracted_fields)
    tone = detect_tone(sanitized_text)
    fraud = detect_fraud_and_score(sanitized_text, extracted_fields, doc_meta)
    deadlines = extract_deadlines(sanitized_text)
    guidance = generate_guidance(doc_meta, fraud, deadlines)
    fingerprint = fingerprint_text(sanitized_text)
 
    llm_output = await generate_llm_output(
        text=sanitized_text,
        extracted_fields=extracted_fields,
        doc_meta=doc_meta,
        fraud=fraud,
        deadlines=deadlines,
        guidance=guidance,
        tone=tone,
        output_language=output_language,
    )
 
    return AnalyzeResponse(
        detected_language=detected_language,
        redactions=redactions,
        document_type=doc_meta["document_type"],
        case_type=doc_meta["case_type"],
        tone=tone,
        extracted_fields=extracted_fields,
        risk_score=fraud["risk_score"],
        risk_label=fraud["risk_label"],
        risk_reasons=fraud["risk_reasons"],
        deadlines=deadlines,
        next_steps=guidance,
        summary=llm_output["summary"],
        explanation=llm_output["explanation"],
        reply_draft=llm_output["reply_draft"],
        fingerprint=fingerprint,
    )
 