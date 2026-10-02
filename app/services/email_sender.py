"""Shared email sending. Uses SMTP (e.g. Gmail) when SMTP_USER and
SMTP_PASSWORD are set, otherwise falls back to Resend."""

import os
import smtplib
from email.message import EmailMessage

import resend


def _smtp_configured() -> bool:
    return bool(os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))


def email_configured(from_email: str | None = None) -> bool:
    if _smtp_configured():
        return True
    return bool(os.getenv("RESEND_API_KEY") and from_email)


def send_email(*, to: str, subject: str, html: str, from_email: str | None = None) -> None:
    if _smtp_configured():
        user = os.environ["SMTP_USER"]
        msg = EmailMessage()
        msg["From"] = from_email or user
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content("Please view this email in an HTML-capable client.")
        msg.add_alternative(html, subtype="html")
        host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        port = int(os.getenv("SMTP_PORT", "465"))
        with smtplib.SMTP_SSL(host, port, timeout=15) as server:
            server.login(user, os.environ["SMTP_PASSWORD"])
            server.send_message(msg)
        return

    api_key = os.getenv("RESEND_API_KEY")
    if not api_key or not from_email:
        raise RuntimeError("Email service not configured.")
    resend.api_key = api_key
    resend.Emails.send({"from": from_email, "to": to, "subject": subject, "html": html})
