from typing import Optional

from app.core.config import settings
from app.models.schemas import SupportChannel
from app.services.resource_service import resolve_location_and_resources


def get_legal_aid_recommendation(
    state: str = "",
    city: str = "",
    preferred_language: str = "en",
    case_type: str = "",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    risk_label: str = "",
    document_type: str = "",
    detected_laws: Optional[list[dict]] = None,
) -> dict:
    resolved = resolve_location_and_resources(
        state=state,
        city=city,
        latitude=latitude,
        longitude=longitude,
        case_type=case_type,
        risk_label=risk_label,
        document_type=document_type,
        detected_laws=detected_laws or [],
    )
    first = (resolved.get("resources") or [
        {
            "relevant_authority_name": "National Legal Services Authority",
            "helpline_number": "15100",
            "official_website": "https://nalsa.gov.in",
        }
    ])[0]
    centers = [
        {
            "name": first["relevant_authority_name"],
            "state": resolved.get("state_detected", "Not detected"),
            "city": resolved.get("city_detected", "Not detected"),
            "contact": first["helpline_number"],
            "address": f"Use the official website or helpline to find the correct office for {resolved.get('state_detected', 'your jurisdiction')}.",
        }
    ]
    return {
        "recommended": True,
        "message": "Use the nearest official legal aid contact below to verify the notice, understand your response window, and get referral support.",
        "preferred_language": preferred_language,
        "case_type": case_type,
        "centers": centers,
        "nalsa_url": first["official_website"],
    }


def get_support_options(
    state: str = "",
    city: str = "",
    preferred_language: str = "en",
    case_type: str = "",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    risk_label: str = "",
    document_type: str = "",
    detected_laws: Optional[list[dict]] = None,
) -> dict:
    resolved = resolve_location_and_resources(
        state=state,
        city=city,
        latitude=latitude,
        longitude=longitude,
        case_type=case_type,
        risk_label=risk_label,
        document_type=document_type,
        detected_laws=detected_laws or [],
    )
    legal_aid = get_legal_aid_recommendation(
        state=resolved.get("state_detected", state),
        city=resolved.get("city_detected", city),
        preferred_language=preferred_language,
        case_type=case_type,
        latitude=latitude,
        longitude=longitude,
        risk_label=risk_label,
        document_type=document_type,
        detected_laws=detected_laws or [],
    )
    return {
        "legal_aid_message": legal_aid["message"],
        "legal_aid_centers": legal_aid["centers"],
        "helplines": [
            SupportChannel(
                title=item["relevant_authority_name"],
                contact=item["helpline_number"],
                description=item["relevance_reason"],
                channel="phone",
            ).model_dump()
            for item in resolved.get("resources", [])
        ],
        "whatsapp_enabled": bool(settings.TWILIO_ACCOUNT_SID and settings.TWILIO_WHATSAPP_FROM),
    }
