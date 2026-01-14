import os

import resend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.redis_client import get_redis, close_redis
from app.services.provider_client import ProviderClient

# Routers
from app.routes.debug import router as debug_router
from app.api.sports import router as sports_router
from app.api.arbs import router as arbs_router


# -------------------------------------------------
# App (DEFINE ONCE)
# -------------------------------------------------

app = FastAPI(
    title="Unbounded Backend",
    version="0.1.0",
)


# -------------------------------------------------
# CORS
# -------------------------------------------------

origins_env = os.getenv("FRONTEND_ORIGINS") or os.getenv(
    "CORS_ORIGINS", "http://localhost:3000"
)
frontend_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# Startup / Shutdown
# -------------------------------------------------

@app.on_event("startup")
async def startup() -> None:
    # Redis
    r = await get_redis()
    await r.ping()

    # Provider client
    if not settings.odds_api_key:
        raise RuntimeError("ODDS_API_KEY missing in .env")

    app.state.provider_client = ProviderClient(
        provider_name="oddsapi",
        base_url="https://api.the-odds-api.com",
        api_key=settings.odds_api_key.get_secret_value(),
        timeout_s=10.0,
        max_retries=5,
        backoff_base_s=0.75,
        backoff_max_s=10.0,
        jitter=True,
    )
    await app.state.provider_client.aopen()

    # Resend
    if os.getenv("RESEND_API_KEY"):
        resend.api_key = os.getenv("RESEND_API_KEY")


@app.on_event("shutdown")
async def shutdown() -> None:
    pc = getattr(app.state, "provider_client", None)
    if pc:
        await pc.aclose()

    await close_redis()


# -------------------------------------------------
# Health
# -------------------------------------------------

@app.get("/")
async def root():
    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# -------------------------------------------------
# Waitlist
# -------------------------------------------------

class WaitlistSignup(BaseModel):
    email: EmailStr


@app.post("/waitlist")
async def waitlist_signup(payload: WaitlistSignup):
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("WAITLIST_FROM_EMAIL")
    notify_email = os.getenv("WAITLIST_NOTIFY_EMAIL")

    if not api_key or not from_email or not notify_email:
        raise HTTPException(status_code=500, detail="Email service not configured.")

    try:
        resend.Emails.send(
            {
                "from": from_email,
                "to": notify_email,
                "subject": "New waitlist signup",
                "html": (
                    "<p>New waitlist signup:</p>"
                    f"<p><strong>{payload.email}</strong></p>"
                ),
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Email send failed.") from exc

    return {"status": "ok"}


# -------------------------------------------------
# Routers (LAST)
# -------------------------------------------------

app.include_router(debug_router, prefix="/debug", tags=["debug"])
app.include_router(sports_router, prefix="/v1", tags=["sports"])
app.include_router(arbs_router, prefix="/v1", tags=["arbs"])
