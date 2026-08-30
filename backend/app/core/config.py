"""Application configuration management."""

import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parent.parent.parent  # INTELLIEMO/backend
PROJECT_ROOT = BASE_DIR.parent  # INTELLIEMO/


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_ENV: str = "development"
    APP_NAME: str = "INTELLIEMO"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'intelliemo.db'}"

    # Model
    MODEL_PATH: str = str(PROJECT_ROOT / "models" / "emotion_model")
    MODEL_NAME: str = "distilbert-base-uncased"
    MAX_TEXT_LENGTH: int = 2000
    CONFIDENCE_THRESHOLD: float = 0.5

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 236
    CORS_ORIGINS: str = "http://localhost:7036,http://localhost:5173,http://localhost:3000,http://localhost:236"

    # Logging
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = (str(PROJECT_ROOT / ".env"), str(BASE_DIR / ".env"))
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
