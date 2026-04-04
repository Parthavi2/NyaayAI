import io
import fitz
import pytesseract
from PIL import Image
from fastapi import UploadFile


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
    return pytesseract.image_to_string(image)


def extract_text_from_pdf_bytes(content: bytes) -> str:
    text_parts = []
    pdf = fitz.open(stream=content, filetype="pdf")
    for page in pdf:
        page_text = page.get_text().strip()
        if page_text:
            text_parts.append(page_text)
        else:
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            text_parts.append(pytesseract.image_to_string(img))
    return "\n".join(text_parts)