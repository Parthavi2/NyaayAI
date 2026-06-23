import os
from fastapi import UploadFile, HTTPException
from app.core.config import settings
 
 
def validate_upload(file: UploadFile) -> None:
    filename = file.filename or ""
    ext = filename.split(".")[-1].lower()
    allowed = [x.strip() for x in settings.ALLOWED_EXTENSIONS.split(",")]
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '.{ext}'. Allowed: {allowed}")
 
 
def ensure_upload_dir() -> None:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
 