"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

const TOKEN_STORAGE_KEY = "unbounded.access_token";
const SAVED_EMAIL_KEY = "unbounded.saved_email";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">(
    "info"
  );
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);

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

  useEffect(() => {
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setMessage(null);
    setPasswordError(null);
    const form = event.currentTarget;

    const formData = new FormData(form);
    const emailValue = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");

    if (mode === "signup") {
      const hasSymbol = /[^A-Za-z0-9]/.test(password);
      if (password.length < 10 || !hasSymbol) {
        setPasswordError(
          "Password must be at least 10 characters and include a symbol."
        );
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match. Please re-enter to confirm.");
        return;
      }
    }

    if (mode === "login") {
      if (rememberEmail) {
        localStorage.setItem(SAVED_EMAIL_KEY, emailValue);
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }
    }

    setIsSubmitting(true);

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
        body: JSON.stringify({ email: emailValue, password })
      });

      if (response.status === 401) {
        setMessageTone("error");
        setMessage(
          "Invalid credentials. Double-check your email and password, or sign up if you don't have an account."
        );
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
        if (mode === "login") {
          setMessageTone("error");
          setMessage(
            "Invalid credentials. Double-check your email and password, or try signing up."
          );
          return;
        }
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
      router.push("/dashboard");
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
                  setPasswordError(null);
                  const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
                  if (savedEmail) {
                    setEmail(savedEmail);
                    setRememberEmail(true);
                  }
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
                  setPasswordError(null);
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
                  value={email}
                  onChange={(event) => {
                    const nextEmail = event.target.value;
                    setEmail(nextEmail);
                    if (rememberEmail) {
                      localStorage.setItem(SAVED_EMAIL_KEY, nextEmail.trim());
                    }
                  }}
                />
              </label>
              <label className="field">
                <span>Password</span>
                <div className="field-input">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    onChange={() => setPasswordError(null)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                        <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                        <path d="M4 4 20 20" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                        <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              {mode === "signup" ? (
                <label className="field">
                  <span>Confirm password</span>
                  <div className="field-input">
                    <input
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                      onChange={() => setPasswordError(null)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                      onClick={() => setShowConfirmPassword((current) => !current)}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                          <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                          <path d="M4 4 20 20" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                          <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
              ) : null}
              {mode === "signup" ? (
                <div className="field-hint">Use 10+ characters and a symbol.</div>
              ) : null}
              {mode === "login" ? (
                <label className="remember-field">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(event) => {
                      const nextChecked = event.target.checked;
                      setRememberEmail(nextChecked);
                      if (nextChecked && email) {
                        localStorage.setItem(SAVED_EMAIL_KEY, email.trim());
                      } else {
                        localStorage.removeItem(SAVED_EMAIL_KEY);
                      }
                    }}
                  />
                  <span>Remember Me</span>
                </label>
              ) : null}
              {passwordError ? (
                <div className="field-error">{passwordError}</div>
              ) : null}
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
