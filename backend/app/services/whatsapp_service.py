from app.core.config import settings
 
 
def send_whatsapp_message(to_number: str, message: str) -> dict:
    if not settings.TWILIO_ACCOUNT_SID:
        return {"success": False, "message": "Twilio not configured. Add credentials to .env to enable WhatsApp."}
 
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            from_=f"whatsapp:{settings.TWILIO_WHATSAPP_FROM}",
            to=f"whatsapp:{to_number}",
            body=message,
        )
        return {"success": True, "sid": msg.sid}
    except Exception as e:
        return {"success": False, "message": str(e)}
 