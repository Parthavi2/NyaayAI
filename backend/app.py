from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "backend running"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    text = await file.read()

    return {
        "extracted_text": "Sample extracted text",
        "simplified": "This is simplified explanation",
        "risk_level": "Low Risk",
        "reply": "This is AI generated reply"
    }