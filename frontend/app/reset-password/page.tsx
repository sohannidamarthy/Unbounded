"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBase = useMemo(() => {
    const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (configuredApiUrl) {
      return configuredApiUrl;
    }
    return process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setMessage("Reset link is missing a token.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`${apiBase}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || "Reset failed.");
      }
      setPassword("");
      setConfirmPassword("");
      setMessage("Password updated. You can log in now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reset link is invalid or expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-link-page">
      <section className="auth-dialog auth-link-card">
        <span className="billing-eyebrow">Account recovery</span>
        <h1>Reset password</h1>
        <form className="auth-dialog-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={10}
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={10}
            />
          </label>
          {message ? <div className="auth-message info">{message}</div> : null}
          <button className="auth-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
        <a className="auth-inline-link" href="/auth">
          Back to login
        </a>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-link-page">
          <section className="auth-dialog auth-link-card">
            <span className="billing-eyebrow">Account recovery</span>
            <h1>Reset password</h1>
            <p>Loading reset link...</p>
          </section>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
