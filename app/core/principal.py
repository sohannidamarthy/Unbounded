from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


Plan = Literal["FREE", "PAID"]


@dataclass(frozen=True)
class Principal:
    """
    Unified identity for request auth:
    - user_id: stable internal id
    - plan: used for rate limits + entitlements
    - auth_type: jwt | api_key
    """
    user_id: str
    plan: Plan
    auth_type: Literal["jwt", "api_key"]
