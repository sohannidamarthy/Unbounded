"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("Verifying email...");

  const apiBase = useMemo(() => {
    const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (configuredApiUrl) {
      return configuredApiUrl;
    }
    return process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("Verification link is missing a token.");
      return;
    }

    fetch(`${apiBase}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Verification failed.");
        }
        setStatus("Email verified. You can log in now.");
      })
      .catch(() => setStatus("Verification link is invalid or expired."));
  }, [apiBase, token]);

  return (
    <main className="auth-link-page">
      <section className="auth-dialog auth-link-card">
        <span className="billing-eyebrow">Account verification</span>
        <h1>Verify email</h1>
        <p>{status}</p>
        <a className="auth-primary auth-link-button" href="/auth">
          Go to login
        </a>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-link-page">
          <section className="auth-dialog auth-link-card">
            <span className="billing-eyebrow">Account verification</span>
            <h1>Verify email</h1>
            <p>Loading verification link...</p>
          </section>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
