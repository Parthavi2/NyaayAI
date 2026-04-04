from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.core.pipeline import run_pipeline
from app.models.schemas import AnalyzeResponse
 
router = APIRouter()
 
 
@router.get("/health")
def health():
    return {"status": "ok", "service": "NyaayAI"}
 
 
@router.post("/analyze-document", response_model=AnalyzeResponse)
async def analyze_document(
    file: UploadFile = File(...),
    output_language: str = Form("en"),
):
    try:
        return await run_pipeline(file=file, output_language=output_language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 