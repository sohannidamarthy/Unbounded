"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">(
    "info"
  );
  const [token, setToken] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000"
    );
  }, []);

  const loginEndpoint =
    process.env.NEXT_PUBLIC_AUTH_LOGIN_URL || `${apiBase}/auth/login`;
  const signupEndpoint =
    process.env.NEXT_PUBLIC_AUTH_SIGNUP_URL || `${apiBase}/auth/signup`;
  const validateEndpoint = `${apiBase}/v1/sports`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    const form = event.currentTarget;

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const endpoint = mode === "login" ? loginEndpoint : signupEndpoint;

    const readErrorMessage = async (response: Response) => {
      const contentType = response.headers.get("content-type") || "";
      try {
        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (typeof data?.detail === "string") {
            return data.detail;
          }
          if (Array.isArray(data?.detail)) {
            const detailText = data.detail
              .map((item: { msg?: string }) => item?.msg)
              .filter(Boolean)
              .join(" ");
            if (detailText) {
              return detailText;
            }
          }
          if (typeof data?.message === "string") {
            return data.message;
          }
        } else {
          const text = await response.text();
          if (text) {
            return text.slice(0, 240);
          }
        }
      } catch (error) {
        return null;
      }

      return null;
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.status === 401) {
        setMessageTone("error");
        setMessage("Invalid credentials. Double-check your email and password.");
        return;
      }

      if (response.status === 429) {
        setMessageTone("error");
        setMessage("Too many attempts. Please wait a minute and try again.");
        return;
      }

      if (response.status === 503) {
        setMessageTone("error");
        setMessage("Auth is warming up. Please try again in a moment.");
        return;
      }

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setMessageTone("error");
        setMessage(detail ? detail : "Something went wrong. Please try again.");
        return;
      }

      const payload = await response.json();
      const accessToken =
        payload.access_token || payload.accessToken || payload.token;

      if (!accessToken) {
        setMessageTone("error");
        setMessage("Login succeeded but no token was returned.");
        return;
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      setToken(accessToken);
      setMessageTone("success");
      setMessage("Authenticated! Token stored for protected calls.");
      form?.reset();
      router.push("/");
    } catch (error) {
      setMessageTone("error");
      const details =
        error instanceof Error ? error.message : String(error ?? "");
      setMessage(
        `Network error${details ? ` (${details})` : ""}. API: ${endpoint}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidate = async () => {
    const storedToken = token || localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setMessageTone("info");
      setMessage("No token found yet. Log in first.");
      return;
    }

    setMessage(null);
    try {
      const response = await fetch(validateEndpoint, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (response.status === 401) {
        setMessageTone("error");
        setMessage("Token rejected (401). Please log in again.");
        return;
      }

      if (response.status === 429) {
        setMessageTone("error");
        setMessage("Rate limited. Try again in a minute.");
        return;
      }

      if (response.status === 503) {
        setMessageTone("error");
        setMessage("Cache not ready. Try again soon.");
        return;
      }

      if (!response.ok) {
        setMessageTone("error");
        setMessage("Validation failed. Check the endpoint response.");
        return;
      }

      setMessageTone("success");
      setMessage("Token looks valid. Session confirmed.");
    } catch (error) {
      setMessageTone("error");
      setMessage("Network error. Could not reach the validation endpoint.");
    }
  };

  return (
    <div className="site auth-page">
      <header className="site-header">
        <div className="brand">
          <Image
            src="/unbounded.jpeg"
            alt="Unbounded logo"
            width={56}
            height={56}
            priority
          />
          <a className="brand-text brand-home-link" href="/">
            <span>Unbounded</span>
          </a>
          <div className="guest-badge">
            <div className="guest-avatar" aria-hidden="true" />
            <span>Guest</span>
          </div>
        </div>
        <nav className="nav-links">
          <a href="/">Arbitrage</a>
          <a href="/">Value Bets</a>
          <a href="/">Tools</a>
          <a href="/">Pricing</a>
          <a href="/">Tutorials</a>
        </nav>
      </header>
      <main>
        <div className="auth-shell">
          <section className="auth-panel">
            <h1>
              Enter your info to {mode === "login" ? "sign in" : "sign up"}
            </h1>
            <p className="auth-subtitle">
              {mode === "login"
                ? "Or get started with a new account."
                : "Already have an account? Sign in."}
            </p>
            <div className="auth-toggle-simple">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setMessage(null);
                  setMessageTone("info");
                }}
              >
                Log in
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => {
                  setMode("signup");
                  setMessage(null);
                  setMessageTone("info");
                }}
              >
                Sign up
              </button>
            </div>
            <form className="auth-form-simple" onSubmit={handleSubmit}>
              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email or mobile number"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                />
              </label>
              <button className="auth-primary" type="submit">
                {isSubmitting
                  ? "Working..."
                  : mode === "login"
                  ? "Continue"
                  : "Create account"}
              </button>
            </form>
            {message ? (
              <div className={`auth-message ${messageTone}`}>{message}</div>
            ) : null}
            <div className="auth-actions" />
          </section>
        </div>
      </main>
    </div>
  );
}
