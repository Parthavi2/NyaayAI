from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.auth import router as auth_router
from app.core.config import settings
from app.db.database import Base, engine
import pytesseract


# Import all models so SQLAlchemy registers them before create_all
import app.models.db_models  # noqa: F401
import app.models.user_models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Legal Aid Platform — NyaayAI",
    version="1.0.0",
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://nyaay-ai-taupe.vercel.app/",   # ← add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(router)


@app.get("/")
def root():
    return {"message": "NyaayAI backend is running", "docs": "/docs"}
