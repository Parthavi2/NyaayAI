from typing import Optional

from app.core.config import settings
from app.models.schemas import SupportChannel
from app.services.resource_service import resolve_location_and_resources


# ── National helplines by case type ─────────────────────────────────────────

_NALSA = {
    "title": "NALSA – National Legal Services Authority",
    "contact": "15100",
    "description": "Free legal aid for all citizens across India",
    "channel": "phone",
}

_CASE_HELPLINES: dict[str, list[dict]] = {
    "cyber crime / fraud": [
        {"title": "Cyber Crime Helpline", "contact": "1930", "description": "Report online fraud, cyber scams, and digital crimes", "channel": "phone"},
        {"title": "Cyber Crime Portal", "contact": "cybercrime.gov.in", "description": "File online complaint at the national cyber crime portal", "channel": "web"},
    ],
    "domestic violence": [
        {"title": "Women Helpline", "contact": "181", "description": "24x7 free support for women in distress", "channel": "phone"},
        {"title": "NCW Helpline", "contact": "7827170170", "description": "National Commission for Women helpline", "channel": "phone"},
        {"title": "Police Emergency", "contact": "112", "description": "National emergency number", "channel": "phone"},
    ],
    "labour / employment": [
        {"title": "Labour Helpline", "contact": "14567", "description": "Ministry of Labour and Employment toll-free", "channel": "phone"},
        {"title": "EPFO Helpline", "contact": "1800-118-005", "description": "Employees Provident Fund Organisation", "channel": "phone"},
    ],
    "consumer": [
        {"title": "National Consumer Helpline", "contact": "1915", "description": "File consumer complaints, free guidance", "channel": "phone"},
        {"title": "Consumer Portal", "contact": "consumerhelpline.gov.in", "description": "Online consumer complaint registration", "channel": "web"},
    ],
    "payment / recovery": [
        {"title": "RBI Banking Ombudsman", "contact": "14448", "description": "Complaints against banks and financial fraud", "channel": "phone"},
        {"title": "SEBI Helpline", "contact": "1800-22-7575", "description": "Securities and investment fraud complaints", "channel": "phone"},
    ],
    "property dispute": [
        {"title": "RERA Helpline", "contact": "1800-11-8111", "description": "Real Estate Regulatory Authority complaints", "channel": "phone"},
    ],
    "criminal": [
        {"title": "Police Emergency", "contact": "112", "description": "National emergency and police helpline", "channel": "phone"},
        {"title": "Legal Aid Defence", "contact": "15100", "description": "NALSA free criminal legal aid", "channel": "phone"},
    ],
    "tax": [
        {"title": "Income Tax Helpline", "contact": "1800-103-0025", "description": "Income Tax Department toll-free helpline", "channel": "phone"},
        {"title": "GST Helpline", "contact": "1800-103-4786", "description": "GST-related queries and complaints", "channel": "phone"},
    ],
    "eviction / tenancy": [
        {"title": "Rent Control Authority", "contact": "Contact District Court", "description": "Disputes under Rent Control Act", "channel": "phone"},
    ],
    "cheque bounce": [
        {"title": "Banking Ombudsman", "contact": "14448", "description": "Banking and cheque-related dispute resolution", "channel": "phone"},
    ],
}

# Keywords to match case_type string → helpline category
_CASE_TYPE_KEYWORDS = {
    "cyber": "cyber crime / fraud",
    "fraud": "cyber crime / fraud",
    "scam": "cyber crime / fraud",
    "domestic": "domestic violence",
    "women": "domestic violence",
    "harassment": "domestic violence",
    "labour": "labour / employment",
    "employment": "labour / employment",
    "wage": "labour / employment",
    "consumer": "consumer",
    "payment": "payment / recovery",
    "recovery": "payment / recovery",
    "cheque": "cheque bounce",
    "property": "property dispute",
    "land": "property dispute",
    "real estate": "property dispute",
    "criminal": "criminal",
    "fir": "criminal",
    "tax": "tax",
    "income tax": "tax",
    "gst": "tax",
    "eviction": "eviction / tenancy",
    "tenancy": "eviction / tenancy",
    "rent": "eviction / tenancy",
}


def _get_case_helplines(case_type: str = "", document_type: str = "") -> list[dict]:
    """Return relevant national helplines based on case type and document type."""
    helplines = [_NALSA]
    added_categories: set[str] = set()

    combined = f"{case_type} {document_type}".lower()

    for keyword, category in _CASE_TYPE_KEYWORDS.items():
        if keyword in combined and category not in added_categories:
            added_categories.add(category)
            helplines.extend(_CASE_HELPLINES.get(category, []))

    return helplines


# ── Public API ───────────────────────────────────────────────────────────────

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

    state_detected = resolved.get("state_detected", "Not detected")
    centers = [
        {
            "name": first["relevant_authority_name"],
            "state": state_detected,
            "city": resolved.get("city_detected", "Not detected"),
            "contact": first["helpline_number"],
            "address": (
                f"Contact the District Legal Services Authority (DLSA) in {state_detected} "
                f"or visit the official helpline for your jurisdiction."
            ),
        }
    ]

    # Build a message tailored to case type
    base_msg = "Use the nearest official legal aid contact to verify the notice and understand your rights."
    if case_type:
        base_msg = (
            f"For a {case_type} matter, you can get free legal assistance from the contacts below. "
            "NALSA provides free legal aid to eligible citizens across India."
        )

    return {
        "recommended": True,
        "message": base_msg,
        "preferred_language": preferred_language,
        "case_type": case_type,
        "centers": centers,
        "nalsa_url": first.get("official_website", "https://nalsa.gov.in"),
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

    # Get case-specific national helplines
    case_helplines = _get_case_helplines(case_type=case_type, document_type=document_type)

    # Add location-based resources from resource_service on top
    location_helplines = [
        SupportChannel(
            title=item["relevant_authority_name"],
            contact=item["helpline_number"],
            description=item["relevance_reason"],
            channel="phone",
        ).model_dump()
        for item in resolved.get("resources", [])
    ]

    # Merge: case-specific first, then location-based (avoiding duplicates by contact number)
    seen_contacts: set[str] = set()
    merged_helplines = []
    for h in case_helplines + location_helplines:
        contact_key = h.get("contact", "").strip()
        if contact_key not in seen_contacts:
            seen_contacts.add(contact_key)
            merged_helplines.append(h)

    return {
        "legal_aid_message": legal_aid["message"],
        "legal_aid_centers": legal_aid["centers"],
        "helplines": merged_helplines,
        "whatsapp_enabled": bool(settings.TWILIO_ACCOUNT_SID and settings.TWILIO_WHATSAPP_FROM),
    }
