"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  getApiBase,
  getStoredToken,
  redirectToLogin,
} from "../lib/auth";

/**
 * Renders children only for a logged-in user. Without a token, or if the API
 * says the token is invalid/expired, redirects to /auth (and back afterwards).
 * The API enforces access too; this keeps logged-out users off the pages.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      redirectToLogin();
      return;
    }

    let cancelled = false;
    fetch(`${getApiBase()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((response) => {
        if (cancelled) {
          return;
        }
        if (response.status === 401 || response.status === 403) {
          redirectToLogin();
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        // API unreachable: don't log the user out for a network blip.
        if (!cancelled) {
          setAllowed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!allowed) {
    return (
      <main className="auth-link-page">
        <section className="auth-dialog auth-link-card">
          <p>Checking your session...</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
