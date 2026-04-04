from app.core.config import settings


def send_whatsapp_message(to_number: str, message: str) -> dict:
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_WHATSAPP_FROM:
        return {
            "success": False,
            "message": "Twilio not configured. Add credentials to .env to enable WhatsApp support escalation.",
        }

    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            from_=f"whatsapp:{settings.TWILIO_WHATSAPP_FROM}",
            to=f"whatsapp:{to_number}",
            body=message,
        )
        return {"success": True, "sid": msg.sid, "message": "WhatsApp escalation sent successfully."}
    except Exception as exc:
        return {"success": False, "message": str(exc)}


def build_support_message(user_message: str, case_context: dict | None = None) -> str:
    case_context = case_context or {}
    parts = [
        "NyaayAI Support Escalation",
        f"Case type: {case_context.get('case_type', 'Not available')}",
        f"Document type: {case_context.get('document_type', 'Not available')}",
        f"Risk: {case_context.get('risk_label', 'Unknown')} ({case_context.get('risk_score', 'n/a')})",
        f"Detected language: {case_context.get('detected_language', 'unknown')}",
        f"Fingerprint: {case_context.get('fingerprint', 'Not available')}",
        "User message:",
        user_message,
    ]
    return "\n".join(parts)
