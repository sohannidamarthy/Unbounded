from __future__ import annotations

import asyncio
import json
import os
import time
from typing import Optional

import redis.asyncio as redis
from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect

router = APIRouter()

CHANNEL = "arb_updates"

MAX_SENDS_PER_SEC = 5
MIN_INTERVAL = 1.0 / MAX_SENDS_PER_SEC

def _redis() -> redis.Redis:
    # Comes from docker compose environment: REDIS_URL: redis://redis:6379/0
    url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    return redis.from_url(url, decode_responses=True)

@router.websocket("/ws/arbs")
async def ws_arbs(websocket: WebSocket):
    await websocket.accept()

    r = _redis()
    pubsub = r.pubsub()
    await pubsub.subscribe(CHANNEL)

    stop = asyncio.Event()
    last_send = 0.0
    latest_payload: Optional[str] = None

    async def reader():
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
                latest_payload = data
        except Exception:
            stop.set()

    async def sender():
        nonlocal last_send, latest_payload
        try:
            while not stop.is_set():
                await asyncio.sleep(0.02)
                if latest_payload is None:
                    continue

                now = time.time()
                if now - last_send < MIN_INTERVAL:
                    continue

                payload = latest_payload
                latest_payload = None
                last_send = now

                try:
                    json.loads(payload)
                    await websocket.send_text(payload)
                except Exception:
                    await websocket.send_text(json.dumps({"type": "arb_update", "raw": str(payload)}))
        except WebSocketDisconnect:
            stop.set()
        except Exception:
            stop.set()

    t1 = asyncio.create_task(reader())
    t2 = asyncio.create_task(sender())

    try:
        while not stop.is_set():
            await asyncio.sleep(15)
            await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        stop.set()
    finally:
        stop.set()
        t1.cancel()
        t2.cancel()
        try:
            await pubsub.unsubscribe(CHANNEL)
        except Exception:
            pass
        try:
            await pubsub.close()
        except Exception:
            pass
        try:
            await r.close()
        except Exception:
            pass
