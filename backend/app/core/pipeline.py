from fastapi import UploadFile

from app.core.security import ensure_upload_dir, validate_upload
from app.models.schemas import AnalyzeResponse, SupportOptions
from app.services.classifier_service import classify_document_and_case
from app.services.deadline_service import extract_deadlines
from app.services.emotion_service import detect_tone
from app.services.extraction_service import extract_fields
from app.services.fingerprint_service import fingerprint_text
from app.services.fraud_service import detect_fraud_and_score
from app.services.guidance_service import generate_guidance
from app.services.language_detector import detect_language
from app.services.law_service import detect_laws
from app.services.legal_aid_service import get_legal_aid_recommendation, get_support_options
from app.services.llm_service import generate_notice_analysis, generate_rights_information
from app.services.notice_parser_service import parse_notice_details
from app.services.ocr_service import extract_text_from_upload
from app.services.redaction_service import redact_pii
from app.services.resource_service import resolve_location_and_resources
from app.services.text_cleaner import clean_text
from app.services.translation_service import get_supported_languages, normalize_output_language


async def run_pipeline(file: UploadFile, output_language: str) -> AnalyzeResponse:
    validate_upload(file)
    ensure_upload_dir()

    normalized_output_language = normalize_output_language(output_language)
    raw_text = await extract_text_from_upload(file)
    if not raw_text.strip():
        raise ValueError("No readable text was extracted from the document. Try a clearer scan or a smaller PDF.")

    cleaned_text = clean_text(raw_text)
    detected_language = detect_language(cleaned_text)
    sanitized_text, redactions = redact_pii(cleaned_text)
    extracted_fields = extract_fields(sanitized_text)
    doc_meta = classify_document_and_case(sanitized_text, extracted_fields)
    tone = detect_tone(sanitized_text)
    fraud = detect_fraud_and_score(sanitized_text, extracted_fields, doc_meta)

    fallback_deadlines = extract_deadlines(sanitized_text)
    fallback_notice_details = parse_notice_details(sanitized_text, extracted_fields, fallback_deadlines, fraud["risk_reasons"])
    fallback_laws = detect_laws(
        text=sanitized_text,
        notice_details=fallback_notice_details,
        document_type=doc_meta["document_type"],
        case_type=doc_meta["case_type"],
    )
    fallback_next_steps = generate_guidance(doc_meta, fraud, fallback_deadlines)

    ai_analysis = await generate_notice_analysis(
        text=sanitized_text,
        extracted_fields=extracted_fields,
        doc_meta=doc_meta,
        fraud=fraud,
        tone=tone,
        output_language=normalized_output_language,
        fallback_notice_details=fallback_notice_details,
        fallback_laws=fallback_laws,
        fallback_deadlines=fallback_deadlines,
        fallback_next_steps=fallback_next_steps,
    )

    rights_information = await generate_rights_information(
        detected_laws=ai_analysis["detected_laws"],
        notice_details=ai_analysis["notice_details"],
        output_language=normalized_output_language,
    )

    fingerprint = fingerprint_text(sanitized_text)
    location_resolution = resolve_location_and_resources(
        case_type=doc_meta.get("case_type", ""),
        risk_label=fraud.get("risk_label", ""),
        document_type=doc_meta.get("document_type", ""),
        detected_laws=ai_analysis["detected_laws"],
    )

    legal_aid = get_legal_aid_recommendation(
        preferred_language=normalized_output_language,
        case_type=doc_meta.get("case_type", ""),
        risk_label=fraud.get("risk_label", ""),
        document_type=doc_meta.get("document_type", ""),
        detected_laws=ai_analysis["detected_laws"],
    )
    support_options = get_support_options(
        preferred_language=normalized_output_language,
        case_type=doc_meta.get("case_type", ""),
        risk_label=fraud.get("risk_label", ""),
        document_type=doc_meta.get("document_type", ""),
        detected_laws=ai_analysis["detected_laws"],
    )

    deadline_items = ai_analysis["deadline_items"]
    deadline_labels = [item["label"] for item in deadline_items if item.get("label")]

    return AnalyzeResponse(
        detected_language=detected_language,
        output_language=normalized_output_language,
        supported_languages=get_supported_languages(),
        redactions=redactions,
        document_type=doc_meta["document_type"],
        case_type=doc_meta["case_type"],
        tone=tone,
        extracted_fields=extracted_fields,
        notice_details=ai_analysis["notice_details"],
        risk_score=fraud["risk_score"],
        risk_label=fraud["risk_label"],
        risk_reasons=fraud["risk_reasons"],
        deadlines=deadline_labels,
        deadline_items=deadline_items,
        next_steps=ai_analysis["next_steps"],
        summary=ai_analysis["summary"],
        explanation=ai_analysis["explanation"],
        reply_draft=ai_analysis["reply_draft"],
        fingerprint=fingerprint,
        detected_laws=ai_analysis["detected_laws"],
        rights_information=rights_information,
        state_detected=location_resolution["state_detected"],
        city_detected=location_resolution["city_detected"],
        state_options=location_resolution.get("state_options", []),
        location_resources=location_resolution["resources"],
        source_text=sanitized_text,
        legal_aid=legal_aid,
        support_options=SupportOptions(**support_options),
    )
