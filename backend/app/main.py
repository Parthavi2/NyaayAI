from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import settings
from app.db.database import Base, engine
 
Base.metadata.create_all(bind=engine)
 
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Legal Aid Platform — NyaayAI",
    version="1.0.0",
    debug=settings.DEBUG,
)
 
# Allow frontend (Next.js on port 3000) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(router)
 
 
@app.get("/")
def root():
    return {"message": "NyaayAI backend is running", "docs": "/docs"}
 