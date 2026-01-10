import json
import time
from typing import Any, Dict, Optional

from app.redis_client import get_redis
from app.core.redis_conventions import ns, REDIS_SCHEMA_VERSION

def arbs_key(sport: str) -> str:
    # Sorted set by ROI (score = roi)
    return ns(f"arbs:{sport.strip().lower()}")

def arb_key(arb_id: str) -> str:
    # Details JSON
    return ns(f"arb:{arb_id}")

async def upsert_arb(sport: str, arb_id: str, roi: float, payload: Dict[str, Any], ttl_seconds: int = 120) -> None:
    r = await get_redis()
    now = int(time.time())
    enriched = {"_v": REDIS_SCHEMA_VERSION, "_ts": now, **payload}

    await r.zadd(arbs_key(sport), {arb_id: float(roi)})
    await r.set(arb_key(arb_id), json.dumps(enriched, separators=(",", ":")), ex=ttl_seconds)

    # Keep the leaderboard itself fresh too (optional)
    await r.expire(arbs_key(sport), ttl_seconds)

async def get_top_arbs(sport: str, limit: int = 50) -> Dict[str, Any]:
    r = await get_redis()
    ids = await r.zrevrange(arbs_key(sport), 0, max(0, limit - 1), withscores=True)
    return {"sport": sport, "arbs": [{"arb_id": arb_id, "roi": roi} for arb_id, roi in ids]}

async def get_arb(arb_id: str) -> Optional[Dict[str, Any]]:
    r = await get_redis()
    raw = await r.get(arb_key(arb_id))
    if raw is None:
        return None
    return json.loads(raw)
