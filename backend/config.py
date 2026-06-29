from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# Load local backend secrets during development. Vercel provides env vars itself.
if not os.getenv("VERCEL"):
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

PLACEHOLDER_PREFIXES = ("your_", "replace_", "change_")
DEFAULT_GOOGLE_CLIENT_ID = "your_google_client_id"


def clean_env_value(value: str) -> str:
    value = (value or "").strip()
    return "" if value.lower().startswith(PLACEHOLDER_PREFIXES) else value


class Settings(BaseSettings):
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", DEFAULT_GOOGLE_CLIENT_ID)
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev_secret_change_in_production_abc123xyz")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 72

    # AI provider
    AI_PROVIDER_API_KEY: str = os.getenv("AI_PROVIDER_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///:memory:" if os.getenv("VERCEL") else "sqlite:///./supportmind.db"
    )
    
    # App
    APP_URL: str = os.getenv("APP_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

settings.GOOGLE_CLIENT_ID = clean_env_value(settings.GOOGLE_CLIENT_ID) or DEFAULT_GOOGLE_CLIENT_ID
settings.GOOGLE_CLIENT_SECRET = clean_env_value(settings.GOOGLE_CLIENT_SECRET)
settings.AI_PROVIDER_API_KEY = clean_env_value(settings.AI_PROVIDER_API_KEY)


def validate_production_settings() -> None:
    """Fail fast when production is missing required security settings."""
    default_secret = "dev_secret_change_in_production_abc123xyz"
    if settings.ENVIRONMENT != "production":
        return
    if not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY == default_secret or settings.JWT_SECRET_KEY.startswith("your_"):
        raise RuntimeError("JWT_SECRET_KEY must be configured with a strong production secret.")
    if not settings.APP_URL.startswith("https://"):
        raise RuntimeError("APP_URL must be an HTTPS origin in production.")
