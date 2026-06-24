# NyaayAI — AI-Powered Legal Aid Platform

NyaayAI helps citizens understand legal notices, FIRs, and summons using AI — with fraud detection, simplified explanations, reply drafts, and nearby legal aid.

---

## What's new in this version

- **Authentication** — Register / Login / Logout with JWT-based sessions
- **Groq LLM** — Replaced Ollama with Groq API (fast, free tier available)

---

## Quick Start

### 1. Get a Groq API key (free)
Go to https://console.groq.com → sign up → create an API key.

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env and set GROQ_API_KEY=your_key_here

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at http://localhost:8000  
API docs at http://localhost:8000/docs

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_USE_MOCK=false" >> .env.local

# Run the dev server
npm run dev
```

Frontend will be available at http://localhost:3000

---

## Environment variables

### Backend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Get from https://console.groq.com |
| `GROQ_MODEL` | optional | Default: `llama3-70b-8192` |
| `SECRET_KEY` | ✅ in prod | JWT signing secret — change in production! |
| `DATABASE_URL` | optional | Default: SQLite `./nyaay_ai.db` |
| `LLM_PROVIDER` | optional | Default: `groq`. Options: `groq`, `openai`, `anthropic` |

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL, default `http://localhost:8000` |
| `NEXT_PUBLIC_USE_MOCK` | Set `true` to use mock data (no backend needed) |

---

## Auth endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account (`name`, `email`, `password`) |
| POST | `/auth/login` | Login (returns JWT token) |
| GET | `/auth/me` | Get current user (requires Bearer token) |

---

## Deployment

### Backend (e.g. Render / Railway)
- Set env vars in dashboard
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Change `SECRET_KEY` to a strong random string
- For production, set `DATABASE_URL` to PostgreSQL

### Frontend (e.g. Vercel)
- Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
- Deploy with `npm run build`
