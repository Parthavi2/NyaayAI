import os
import uuid
 
 
def build_safe_filename(original_name: str) -> str:
    ext = original_name.split(".")[-1].lower()
    return f"{uuid.uuid4().hex}.{ext}"
 
 
def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)
 
 
def delete_file(path: str) -> None:
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass