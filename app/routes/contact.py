import csv
import html
import io
import logging
import os

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.core.rate_limit import rate_limit
from app.db.models.contact_messages import ContactMessage
from app.db.session import get_db
from app.services.email_sender import email_configured, send_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactMessagePayload(BaseModel):
    full_name: str = Field(max_length=100)
    email: EmailStr
    reason: str = Field(max_length=100)
    message: str = Field(max_length=5000)

    @field_validator("full_name", "reason", "message")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("This field cannot be blank.")
        return stripped

    @field_validator("full_name", "reason")
    @classmethod
    def single_line(cls, value: str) -> str:
        if any(ch in value for ch in "\r\n"):
            raise ValueError("Line breaks are not allowed in this field.")
        return value


def _notify_contact(full_name: str, email: str, reason: str, message: str) -> None:
    """Best-effort email notification. Persistence to Postgres is the
    source of truth, so a missing/misconfigured email service should
    never fail the submission."""
    from_email = os.getenv("WAITLIST_FROM_EMAIL")
    notify_email = os.getenv("CONTACT_NOTIFY_EMAIL") or os.getenv(
        "WAITLIST_NOTIFY_EMAIL"
    )

    if not notify_email or not email_configured(from_email):
        return

    try:
        send_email(
            to=notify_email,
            from_email=from_email,
            subject=f"New contact message: {reason}",
            html=(
                "<p>New contact form submission:</p>"
                f"<p><strong>{html.escape(full_name)}</strong> ({html.escape(email)})</p>"
                f"<p>Reason: {html.escape(reason)}</p>"
                f"<p>{html.escape(message)}</p>"
            ),
        )
    except Exception:
        logger.exception("Contact form notification email failed.")


@router.post(
    "",
    dependencies=[Depends(rate_limit("contact", ip_limit=5, window_seconds=600))],
)
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
