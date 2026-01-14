from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, ListResponse


class SportItem(APIModel):
    key: str = Field(..., description="Sport key, e.g. nba")
    title: str = Field(..., description="Human-readable sport name")


class SportsResponse(ListResponse[SportItem]):
    pass
