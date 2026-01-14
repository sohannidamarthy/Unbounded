import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict


logger = logging.getLogger("ingestion")


def log_event(event: str, **fields: Any) -> None:
    payload: Dict[str, Any] = {
        "ts_utc": datetime.now(timezone.utc).isoformat(),
        "event": event,
        **fields,
    }
    logger.info(json.dumps(payload, default=str))

