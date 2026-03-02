from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Core DB & Auth
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    # OpenRouter / AI Config (NEW)
    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_MODEL: str = "openai/gpt-4o-mini"

    # HuggingFace fallback (optional)
    HF_FALLBACK_MODEL: str = "mistralai/mistral-7b-instruct"

    class Config:
        env_file = ".env"
        extra = "allow"  # ✅ Prevent future crashes if env expands


settings = Settings()
