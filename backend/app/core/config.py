from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "NyaayAI"
    ENV: str = "dev"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./nyaay_ai.db"

    # LLM config: set LLM_PROVIDER=ollama, openai, or mock.
    LLM_PROVIDER: str = "mock"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"
    AI_HTTP_TIMEOUT_SEC: int = 120

    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    USE_GOOGLE_VISION: bool = False
    OCR_PROVIDER: str = "hybrid"
    OCR_LANGUAGES: str = "en,hi"
    OCR_PREFER_GOOGLE_FOR_SCANNED: bool = True
    OCR_MAX_PDF_PAGES: int = 25
    OCR_MAX_SCANNED_PAGES: int = 8
    OCR_TARGET_TEXT_CHARS: int = 18000
    OCR_PDF_RENDER_DPI: int = 170

    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: str = "pdf,jpg,jpeg,png"

    ENABLE_REGIONAL_LANGUAGES: bool = True
    DEFAULT_OUTPUT_LANGUAGE: str = "en"
    ENABLE_CONTEXT_ASSISTANT: bool = True

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
