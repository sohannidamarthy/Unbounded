from functools import lru_cache
from typing import Literal, Optional

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # -------------------------
    # Environment
    # -------------------------
    env: Literal["development", "staging", "production"] = "development"

    # -------------------------
    # Database & Cache
    # -------------------------
    database_url: str = Field(..., description="PostgreSQL connection URL")
    redis_url: str = Field(
        "redis://localhost:6379/0",
        description="Redis connection URL",
    )

    # -------------------------
    # Security
    # -------------------------
    jwt_secret: SecretStr = Field(..., description="JWT signing secret")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # -------------------------
    # External APIs
    # -------------------------
    odds_api_key: Optional[SecretStr] = None

    # -------------------------
    # Pydantic Settings Config
    # -------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance.
    Ensures settings are only loaded once.
    """
    return Settings()


# Import-friendly singleton
settings = get_settings()
