import os

import resend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from app.redis_client import get_redis, close_redis
from app.routes.debug import router as debug_router

app = FastAPI(
    title="Unbounded Backend",
    version="0.1.0",
)

# --- CORS ---
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

# --- Redis lifecycle ---
@app.on_event("startup")
async def startup():
    r = await get_redis()
    await r.ping()


@app.on_event("shutdown")
async def shutdown():
    await close_redis()


@app.get("/")
async def root():
    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# --- Waitlist ---
class WaitlistSignup(BaseModel):
    email: EmailStr


@app.post("/waitlist")
async def waitlist_signup(payload: WaitlistSignup):
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("WAITLIST_FROM_EMAIL")
    notify_email = os.getenv("WAITLIST_NOTIFY_EMAIL")

    if not api_key or not from_email or not notify_email:
        raise HTTPException(status_code=500, detail="Email service not configured.")

    resend.api_key = api_key

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


# --- Routers ---
app.include_router(debug_router)

