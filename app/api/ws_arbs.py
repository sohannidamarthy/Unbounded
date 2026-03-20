from __future__ import annotations

import asyncio
import json
import logging
import os
import time

import redis.asyncio as redis
from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect

router = APIRouter()
logger = logging.getLogger(__name__)

CHANNEL = "arb_updates"
PING_INTERVAL_SECONDS = 15.0

MAX_SENDS_PER_SEC = 5
MIN_INTERVAL = 1.0 / MAX_SENDS_PER_SEC


def _redis() -> redis.Redis:
    # Comes from docker compose environment: REDIS_URL: redis://redis:6379/0
    url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    return redis.from_url(url, decode_responses=True)


def _coerce_payload(payload: str) -> str:
    try:
        json.loads(payload)
        return payload
    except Exception:
        return json.dumps({"type": "arb_update", "raw": str(payload)})


@router.websocket("/ws/arbs")
async def ws_arbs(websocket: WebSocket):
    r = _redis()
    pubsub = r.pubsub()
    await pubsub.subscribe(CHANNEL)
    await websocket.accept()

    stop = asyncio.Event()
    last_send = 0.0
    last_ping = time.monotonic()
    latest_payload: str | None = None

    async def reader() -> None:
        nonlocal latest_payload
        try:
            async for msg in pubsub.listen():
                if stop.is_set():
                    break
                if not msg or msg.get("type") != "message":
                    continue
                data = msg.get("data")
                if data is None:
                    continue
                latest_payload = str(data)
        except Exception:
            if not stop.is_set():
                logger.exception("WebSocket Redis reader for %s failed", CHANNEL)
                stop.set()

    async def sender() -> None:
        nonlocal last_send, last_ping, latest_payload
        try:
            while not stop.is_set():
                now = time.monotonic()
                if latest_payload is not None and now - last_send >= MIN_INTERVAL:
                    payload = latest_payload
                    latest_payload = None
                    last_send = now
                    await websocket.send_text(_coerce_payload(payload))

                if now - last_ping >= PING_INTERVAL_SECONDS:
                    await websocket.send_text(json.dumps({"type": "ping"}))
                    last_ping = now

                await asyncio.sleep(0.02)
        except WebSocketDisconnect:
            stop.set()
        except Exception:
            if not stop.is_set():
                logger.exception("WebSocket sender for %s failed", CHANNEL)
                stop.set()

    reader_task = asyncio.create_task(reader())
    sender_task = asyncio.create_task(sender())

    try:
        while not stop.is_set():
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected from %s", CHANNEL)
    except Exception:
        logger.exception("WebSocket stream for %s failed", CHANNEL)
    finally:
        stop.set()
        reader_task.cancel()
        sender_task.cancel()
        for task in (reader_task, sender_task):
            try:
                await task
            except asyncio.CancelledError:
                pass
            except Exception:
                logger.debug("WebSocket task shutdown for %s failed", CHANNEL, exc_info=True)
        try:
            await pubsub.unsubscribe(CHANNEL)
        except Exception:
            logger.debug("Failed to unsubscribe from %s", CHANNEL, exc_info=True)
        try:
            await pubsub.aclose()
        except Exception:
            logger.debug("Failed to close Redis pubsub", exc_info=True)
        try:
            await r.aclose()
        except Exception:
            logger.debug("Failed to close Redis client", exc_info=True)
