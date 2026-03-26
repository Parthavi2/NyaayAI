from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import spacy
nlp = spacy.load("en_core_web_sm")
classifier = pipeline("text-classification",
                      model="distilbert-base-uncased")
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
    text = (await file.read()).decode()

    result = classifier(text[:512])[0]

    if result['score'] > 0.7:
        risk = "HIGH"
    else:
        risk = "LOW"

    simplified = "This notice is asking for legal compliance. Please verify sender."

    reply = "I request verification of this legal notice before taking action."

    return {
        "extracted_text": text,
        "simplified": simplified,
        "risk_level": risk,
        "reply": reply
    }


@app.post("/risk")
async def risk(data: dict):
    text = data["text"]

    score = 20

    if "urgent" in text.lower():
        score += 30

    if "payment" in text.lower():
        score += 30

    if "legal action" in text.lower():
        score += 20

    if score < 30:
        level = "LOW"
    elif score < 70:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return {
        "score": score,
        "level": level
    }


@app.post("/detect-fake")
async def detect_fake(data: dict):
    text = data["text"].lower()

    score = 10
    reason = []

    if "urgent payment" in text:
        score += 30
        reason.append("Urgent payment request detected")

    if "legal action within 24 hours" in text:
        score += 25
        reason.append("Unrealistic deadline")

    if "click link" in text:
        score += 20
        reason.append("Suspicious link")

    if "transfer money" in text:
        score += 15
        reason.append("Money transfer request")

    if score > 100:
        score = 95

    return {
        "score": score,
        "reason": ", ".join(reason)
    }


@app.post("/timeline")
async def timeline(data: dict):
    text = data["text"].lower()

    timeline = []

    if "within 24 hours" in text:
        timeline.append({
            "date": "24 Hours",
            "event": "Urgent payment demanded"
        })

    if "7 days" in text:
        timeline.append({
            "date": "7 Days",
            "event": "Legal response deadline"
        })

    if "15 days" in text:
        timeline.append({
            "date": "15 Days",
            "event": "Court notice response"
        })

    if "30 days" in text:
        timeline.append({
            "date": "30 Days",
            "event": "Final legal deadline"
        })

    return {
        "timeline": timeline
    }