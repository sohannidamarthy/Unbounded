import csv
import io
import logging
import os

import resend
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.db.models.founders_circle import FoundersCircleSignup
from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/founders-circle", tags=["founders-circle"])


class FoundersCircleSignupPayload(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr


def _notify_signup(first_name: str, last_name: str, email: str) -> None:
    """Best-effort email notification. Persistence to Postgres is the
    source of truth, so a missing/misconfigured email service should
    never fail the signup."""
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("WAITLIST_FROM_EMAIL")
    notify_email = os.getenv("FOUNDERS_CIRCLE_NOTIFY_EMAIL") or os.getenv(
        "WAITLIST_NOTIFY_EMAIL"
    )

    if not api_key or not from_email or not notify_email:
        return

    resend.api_key = api_key
    try:
        resend.Emails.send(
            {
                "from": from_email,
                "to": notify_email,
                "subject": "New Founders Circle signup",
                "html": (
                    "<p>New Founders Circle signup:</p>"
                    f"<p><strong>{first_name} {last_name}</strong></p>"
                    f"<p>{email}</p>"
                ),
            }
        )
    except Exception:
        logger.exception("Founders Circle notification email failed.")


@router.post("/signup")
async def founders_circle_signup(
    payload: FoundersCircleSignupPayload,
    db: Session = Depends(get_db),
) -> dict:
    first_name = payload.first_name.strip()
    last_name = payload.last_name.strip()

    signup = FoundersCircleSignup(
        first_name=first_name,
        last_name=last_name,
        email=str(payload.email),
    )
    db.add(signup)
    db.commit()

    _notify_signup(first_name, last_name, str(payload.email))

    return {"status": "ok"}


@router.options("/signup")
async def founders_circle_signup_options() -> dict:
    return {"status": "ok"}


@router.get("/export")
async def founders_circle_export(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
) -> StreamingResponse:
    stmt = select(FoundersCircleSignup).order_by(FoundersCircleSignup.created_at)
    signups = db.scalars(stmt).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["first_name", "last_name", "email", "created_at"])
    for signup in signups:
        writer.writerow(
            [
                signup.first_name,
                signup.last_name,
                signup.email,
                signup.created_at.isoformat() if signup.created_at else "",
            ]
        )
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=founders_circle_signups.csv"
        },
    )
