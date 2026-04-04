import io
import fitz
from PIL import Image
from typing import List
 
 
def pdf_to_images(content: bytes) -> List[Image.Image]:
    images = []
    pdf = fitz.open(stream=content, filetype="pdf")
    for page in pdf:
        pix = page.get_pixmap(dpi=200)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        images.append(img)
    return images
 
 
def get_pdf_page_count(content: bytes) -> int:
    pdf = fitz.open(stream=content, filetype="pdf")
    return len(pdf)
 