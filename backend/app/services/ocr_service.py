import io
from functools import lru_cache

import fitz
import numpy as np
import pytesseract
from PIL import Image
from fastapi import UploadFile

from app.core.config import settings


async def extract_text_from_upload(file: UploadFile) -> str:
    content = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf_bytes(content)
    elif filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    return extract_text_from_image_bytes(content)


def extract_text_from_image_bytes(content: bytes) -> str:
    image = Image.open(io.BytesIO(content))
    return _extract_text_from_image(image)


def extract_text_from_pdf_bytes(content: bytes) -> str:
    text_parts = []
    pdf = fitz.open(stream=content, filetype="pdf")
    scanned_pages_used = 0

    for page_index, page in enumerate(pdf):
        if page_index >= settings.OCR_MAX_PDF_PAGES:
            break

        page_text = page.get_text().strip()
        if page_text:
            text_parts.append(page_text)
        else:
            if scanned_pages_used >= settings.OCR_MAX_SCANNED_PAGES:
                continue

            pix = page.get_pixmap(dpi=settings.OCR_PDF_RENDER_DPI)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            ocr_text = _extract_text_from_image(img)
            if ocr_text:
                text_parts.append(ocr_text)
                scanned_pages_used += 1

        if _joined_length(text_parts) >= settings.OCR_TARGET_TEXT_CHARS:
            break

    return "\n".join(text_parts)


def _extract_text_from_image(image: Image.Image) -> str:
    provider = settings.OCR_PROVIDER.strip().lower()

    if provider == "google":
        return _google_vision_text(image) or _local_ocr_text(image)
    if provider == "local":
        return _local_ocr_text(image)
    if provider == "tesseract":
        return _tesseract_text(image)
    if provider == "easyocr":
        return _easyocr_text(image) or _tesseract_text(image)

    google_text = _google_vision_text(image) if settings.USE_GOOGLE_VISION else ""
    local_text = _local_ocr_text(image)
    return _pick_best_text(primary=google_text, secondary=local_text)


def _local_ocr_text(image: Image.Image) -> str:
    local_text = _easyocr_text(image)
    if local_text:
        return local_text
    return _tesseract_text(image)


def _tesseract_text(image: Image.Image) -> str:
    try:
        language_hint = _to_tesseract_lang(settings.OCR_LANGUAGES)
        return pytesseract.image_to_string(_prepare_image(image), lang=language_hint).strip()
    except Exception:
        return pytesseract.image_to_string(_prepare_image(image)).strip()


def _easyocr_text(image: Image.Image) -> str:
    try:
        reader = _get_easyocr_reader()
        result = reader.readtext(np.array(_prepare_image(image)), detail=0, paragraph=True)
        return "\n".join(part.strip() for part in result if str(part).strip()).strip()
    except Exception:
        return ""


def _google_vision_text(image: Image.Image) -> str:
    if not settings.USE_GOOGLE_VISION:
        return ""

    try:
        from google.cloud import vision

        buffer = io.BytesIO()
        _prepare_image(image).save(buffer, format="PNG")
        content = buffer.getvalue()

        client = vision.ImageAnnotatorClient()
        response = client.document_text_detection(image=vision.Image(content=content))
        if response.error.message:
            return ""

        text = (response.full_text_annotation.text or "").strip()
        if text:
            return text

        annotations = response.text_annotations or []
        return annotations[0].description.strip() if annotations else ""
    except Exception:
        return ""


def _pick_best_text(primary: str, secondary: str) -> str:
    primary = (primary or "").strip()
    secondary = (secondary or "").strip()
    if not primary:
        return secondary
    if not secondary:
        return primary
    return primary if len(primary) >= len(secondary) else secondary


def _joined_length(parts: list[str]) -> int:
    return sum(len(part) for part in parts)


def _prepare_image(image: Image.Image) -> Image.Image:
    processed = image.convert("L")
    return processed.point(lambda pixel: 0 if pixel < 160 else 255, mode="1")


def _to_tesseract_lang(language_csv: str) -> str:
    mapping = {
        "en": "eng",
        "hi": "hin",
        "bn": "ben",
        "gu": "guj",
        "kn": "kan",
        "ml": "mal",
        "mr": "mar",
        "or": "ori",
        "pa": "pan",
        "ta": "tam",
        "te": "tel",
        "ur": "urd",
    }
    resolved = []
    for code in [part.strip().lower() for part in language_csv.split(",") if part.strip()]:
        resolved.append(mapping.get(code, code))
    return "+".join(dict.fromkeys(resolved)) or "eng"


@lru_cache(maxsize=1)
def _get_easyocr_reader():
    import easyocr

    languages = _to_easyocr_langs(settings.OCR_LANGUAGES)
    return easyocr.Reader(languages, gpu=False)


def _to_easyocr_langs(language_csv: str) -> list[str]:
    supported = {
        "en": "en",
        "hi": "hi",
        "bn": "bn",
        "gu": "gu",
        "kn": "kn",
        "mr": "mr",
        "ta": "ta",
        "te": "te",
        "ur": "ur",
    }
    resolved = []
    for code in [part.strip().lower() for part in language_csv.split(",") if part.strip()]:
        if code in supported:
            resolved.append(supported[code])
    return resolved or ["en"]
