from __future__ import annotations

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
    redis_url: str = Field(..., description="Redis connection URL")

    # -------------------------
    # Security / Auth
    # -------------------------
    jwt_secret: SecretStr = Field(..., description="JWT signing secret")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # If you want easy key rotation later
    api_key_pepper: SecretStr = Field(SecretStr("change-me"), description="Server-side pepper for API key hashing")

    # Auth toggles
    allow_jwt_auth: bool = True
    allow_api_key_auth: bool = True

    # -------------------------
    # Rate limiting (plan-based)
    # -------------------------
    # Requests per minute
    limit_free_rpm: int = 60
    limit_paid_rpm: int = 600

    # Burst limits per 10 seconds (helps prevent spikes)
    limit_free_burst_10s: int = 20
    limit_paid_burst_10s: int = 120

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
    return Settings()


settings = get_settings()
