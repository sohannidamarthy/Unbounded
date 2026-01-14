from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RedisKeys:
    """
    Canonical Redis key builder.
    Version keys so we can migrate formats safely without breaking clients.
    """
    VERSION: str = "v1"

    # ---------- Sports ----------
    def sports_all(self) -> str:
        return f"sports:all:{self.VERSION}"

    # ---------- Events ----------
    def events_upcoming_by_sport(self, sport_key: str) -> str:
        return f"events:{sport_key}:upcoming:{self.VERSION}"

    def event_by_id(self, event_id: str) -> str:
        return f"events:id:{event_id}:{self.VERSION}"

    # ---------- Odds ----------
    def odds_latest_by_event(self, event_id: str) -> str:
        return f"odds:{event_id}:latest:{self.VERSION}"

    # Optional: odds by market, if you shard by market_key
    def odds_latest_by_event_market(self, event_id: str, market_key: str) -> str:
        return f"odds:{event_id}:{market_key}:latest:{self.VERSION}"

    # ---------- Arbs ----------
    def arbs_latest_by_sport(self, sport_key: str) -> str:
        return f"arbs:{sport_key}:latest:{self.VERSION}"

    # ---------- Meta / health ----------
    def cache_meta(self, name: str) -> str:
        return f"meta:{name}:{self.VERSION}"


redis_keys = RedisKeys()
