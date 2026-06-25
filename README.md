# ⚖️ NyaayAI
### AI-Powered Legal Aid Platform for Underserved Communities

**Making justice accessible through AI — one document at a time.**

🌐 **Live Application:** https://nyaay-ai-taupe.vercel.app  
📖 **API Documentation:** https://nyaayai-tptx.onrender.com/docs  
🔗 **Backend API:** https://nyaayai-tptx.onrender.com

---

## 📌 Overview

NyaayAI is an AI-powered legal aid platform designed to help citizens understand legal documents without requiring expensive legal consultation.

Users can upload legal documents such as:

- FIRs
- Court Summons
- Legal Notices
- Tax Notices
- Eviction Notices
- Contracts
- Government Communications
- Scanned Legal Documents

The platform automatically analyzes the uploaded document and provides:

✅ Plain-language explanation  
✅ Important clauses and obligations  
✅ Fraud/Fake notice detection with risk scoring  
✅ Legal rights and protections  
✅ Recommended next steps  
✅ AI-generated reply drafts  
✅ Legal aid and helpline recommendations  
✅ Multi-language support

NyaayAI aims to bridge the legal knowledge gap by making legal information understandable and accessible to everyone.

---

# ✨ Key Features

## 📄 Intelligent Document Analysis

- Upload PDF, image, or scanned legal documents
- OCR-powered text extraction
- AI-driven clause extraction
- Important dates and deadlines detection
- Obligation and penalty identification
- Legal risk assessment

---

## 🚨 Fraud Detection

The platform evaluates uploaded notices and identifies potential indicators of:

- Fake legal notices
- Scam communications
- Fraudulent demands
- Suspicious legal threats

Each analysis includes:

- Fraud probability score
- Risk explanation
- Verification recommendations

---

## 🧠 AI Legal Guidance

The AI provides:

- Simplified explanation of legal language
- Citizen-friendly summaries
- Rights and protections applicable to the document
- Suggested actions to take
- Potential legal concerns

---

## ✍️ Draft Reply Generator

Generate professional responses for:

- Legal notices
- Government notices
- Tax communications
- Consumer complaints
- Civil disputes

The generated drafts can be reviewed and modified before use.

---

## 🌍 Multilingual Support

Supported Languages:

- English
- Hindi
- Marathi
- Tamil
- Telugu
- Bengali
- Gujarati

Language detection and translation are handled automatically.

---

## 📞 Legal Aid Resources

Based on case type and user location, NyaayAI can recommend:

- Government legal aid services
- Consumer helplines
- Women's helplines
- Cybercrime reporting channels
- Legal assistance resources

---

## 🔐 Secure Authentication

- JWT Authentication
- Password Hashing (bcrypt)
- OAuth2 Password Flow
- Protected User Dashboard

---

## 📂 User Dashboard

Users can:

- View previous analyses
- Re-open documents
- Re-analyze documents
- Download reports
- Track case history

---

# 🏗 System Architecture

```text
┌──────────────────────────────────────────────────────┐
│                     User Browser                     │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                  Next.js Frontend                    │
│         React + TypeScript + Tailwind CSS            │
└───────────────────────┬──────────────────────────────┘
                        │ HTTPS / REST
                        ▼
┌──────────────────────────────────────────────────────┐
│                   FastAPI Backend                    │
│      Authentication • Analysis • OCR • AI           │
└───────┬─────────────────┬────────────────────────────┘
        │                 │
        ▼                 ▼
┌───────────────┐   ┌───────────────────────────────┐
│ SQLite /      │   │ Groq API (LLaMA 3 70B)        │
│ PostgreSQL    │   │ OpenAI (Optional Fallback)    │
└───────────────┘   │ Claude (Optional Fallback)    │
                    └───────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ OCR Services      │
                    │ Tesseract         │
                    │ EasyOCR           │
                    │ PyMuPDF           │
                    └───────────────────┘
```

---

# 🛠 Tech Stack

## Frontend

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Lucide React

---

## Backend

- Python 3.13
- FastAPI
- SQLAlchemy
- SQLite
- PostgreSQL (Production Ready)
- Pydantic
- Pydantic Settings

---

## AI & LLM

- Groq API (LLaMA 3 70B)
- OpenAI GPT-4o (Optional)
- Anthropic Claude (Optional)

---

## OCR & Document Processing

- PyMuPDF
- Pytesseract
- EasyOCR
- pdf2image
- Pillow
- Google Cloud Vision (Optional)

---

## NLP

- spaCy
- LangDetect

---

## Authentication

- JWT Tokens
- python-jose
- Passlib (bcrypt)
- OAuth2

---

## Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | SQLite / PostgreSQL |

---

# 📁 Project Structure

```text
NyaayAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── routes.py
│   │   │   └── deps.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── crud.py
│   │   │
│   │   ├── models/
│   │   │   ├── db_models.py
│   │   │   ├── user_models.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── services/
│   │   │   ├── llm_service.py
│   │   │   ├── ocr_service.py
│   │   │   ├── fraud_service.py
│   │   │   ├── guidance_service.py
│   │   │   ├── legal_aid_service.py
│   │   │   ├── translation_service.py
│   │   │   ├── resource_service.py
│   │   │   └── pipeline.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── context/
    │   ├── lib/
    │   └── types/
    │
    ├── package.json
    ├── next.config.js
    └── .env.local
```

---

# 📡 API Endpoints

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | `/` | Health Check |
| POST | `/auth/register` | Register User |
| POST | `/auth/login` | Login User |
| GET | `/auth/me` | Current User |
| POST | `/analyze-document` | Upload & Analyze Document |
| POST | `/case-assistant` | Ask Questions About Case |
| GET | `/support/options` | Legal Aid Resources |
| POST | `/analysis/translate` | Translate Analysis |
| GET | `/health` | API Health Status |

---

# 🚀 Quick Start

## Prerequisites

- Python 3.10+
- Node.js 18+
- Tesseract OCR
- Groq API Key

---

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt

python -m spacy download en_core_web_sm
```

Create `.env`

```env
GROQ_API_KEY=gsk_your_key_here

SECRET_KEY=change-this-in-production

DATABASE_URL=sqlite:///./nyaay_ai.db

LLM_PROVIDER=groq
```

Run Backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

NEXT_PUBLIC_USE_MOCK=false
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# ☁️ Deployment

## Backend (Render)

| Setting | Value |
|-----------|---------|
| Root Directory | backend |
| Build Command | pip install -r requirements.txt |
| Start Command | uvicorn app.main:app --host 0.0.0.0 --port $PORT |

Environment Variables:

```env
GROQ_API_KEY=your_key

SECRET_KEY=your_secret

DATABASE_URL=sqlite:///./nyaay_ai.db
```

---

## Frontend (Vercel)

| Setting | Value |
|-----------|---------|
| Framework | Next.js |
| Root Directory | frontend |

Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://nyaayai-tptx.onrender.com

NEXT_PUBLIC_USE_MOCK=false
```

---

# 🔐 Environment Variables

## Backend

```env
GROQ_API_KEY=gsk_...

SECRET_KEY=...

DATABASE_URL=sqlite:///./nyaay_ai.db

LLM_PROVIDER=groq
```

---

## Frontend

```env
NEXT_PUBLIC_API_URL=https://nyaayai-tptx.onrender.com

NEXT_PUBLIC_USE_MOCK=false
```

---

# 🐛 Common Issues

| Problem | Solution |
|----------|----------|
| Failed to fetch | Backend may be sleeping on Render free tier |
| CORS error | Add frontend URL to allow_origins |
| Database error | Verify DATABASE_URL |
| OCR not working | Ensure Tesseract is installed |
| Vercel build fails | Confirm frontend root directory |
| Groq errors | Verify GROQ_API_KEY |

---

# 🗺 Roadmap

- Voice-based legal assistance
- AI legal chatbot for follow-up questions
- Lawyer referral network
- Case tracking dashboard
- PDF report export
- WhatsApp integration
- Regional language expansion
- PostgreSQL migration with Alembic
- Mobile application (Android & iOS)

---

# ❤️ Mission

Millions of people struggle to understand legal notices, government communications, and court documents.

NyaayAI aims to make legal information understandable, accessible, and actionable for everyone through responsible AI.

**Justice should not depend on whether someone can afford a lawyer.**

---

## 👨‍💻 Built With

FastAPI • Next.js • Groq LLaMA • OCR • SQLAlchemy • Tailwind CSS • JWT Authentication

---

## 📜 License

This project is licensed under the MIT License.

---

### ⭐ If you found this project useful, consider giving it a star on GitHub.
