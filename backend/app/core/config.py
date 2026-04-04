from pydantic_settings import BaseSettings, SettingsConfigDict
 
 
class Settings(BaseSettings):
    APP_NAME: str = "NyaayAI"
    ENV: str = "dev"
    DEBUG: bool = True
 
    DATABASE_URL: str = "sqlite:///./nyaay_ai.db"
 
    # LLM config — set LLM_PROVIDER=ollama to use Ollama, =openai for OpenAI, =mock for no LLM
    LLM_PROVIDER: str = "mock"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
 
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
 
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    USE_GOOGLE_VISION: bool = False
 
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: str = "pdf,jpg,jpeg,png"
 
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""
 
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
 
 
settings = Settings()
 