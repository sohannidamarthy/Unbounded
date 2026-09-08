import csv
import io
import logging
import os

import resend
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.db.models.contact_messages import ContactMessage
from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactMessagePayload(BaseModel):
    full_name: str
    email: EmailStr
    reason: str
    message: str

    @field_validator("full_name", "reason", "message")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("This field cannot be blank.")
        return stripped


def _notify_contact(full_name: str, email: str, reason: str, message: str) -> None:
    """Best-effort email notification. Persistence to Postgres is the
    source of truth, so a missing/misconfigured email service should
    never fail the submission."""
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("WAITLIST_FROM_EMAIL")
    notify_email = os.getenv("CONTACT_NOTIFY_EMAIL") or os.getenv(
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
                "subject": f"New contact message: {reason}",
                "html": (
                    "<p>New contact form submission:</p>"
                    f"<p><strong>{full_name}</strong> ({email})</p>"
                    f"<p>Reason: {reason}</p>"
                    f"<p>{message}</p>"
                ),
            }
        )
    except Exception:
        logger.exception("Contact form notification email failed.")


@router.post("")
async def submit_contact_message(
    payload: ContactMessagePayload,
    db: Session = Depends(get_db),
) -> dict:
    contact_message = ContactMessage(
        full_name=payload.full_name,
        email=str(payload.email),
        reason=payload.reason,
        message=payload.message,
    )
    db.add(contact_message)
    db.commit()

    _notify_contact(payload.full_name, str(payload.email), payload.reason, payload.message)

    return {"status": "ok"}


@router.options("")
async def submit_contact_message_options() -> dict:
    return {"status": "ok"}


@router.get("/export")
async def export_contact_messages(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
) -> StreamingResponse:
    stmt = select(ContactMessage).order_by(ContactMessage.created_at)
    messages = db.scalars(stmt).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["full_name", "email", "reason", "message", "created_at"])
    for msg in messages:
        writer.writerow(
            [
                msg.full_name,
                msg.email,
                msg.reason,
                msg.message,
                msg.created_at.isoformat() if msg.created_at else "",
            ]
        )
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=contact_messages.csv"
        },
    )
