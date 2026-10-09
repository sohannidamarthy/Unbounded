export const TOKEN_STORAGE_KEY = "unbounded.access_token";

export function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"
  );
}

export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
}

export function loginUrl(nextPath?: string): string {
  return nextPath ? `/auth?next=${encodeURIComponent(nextPath)}` : "/auth";
}

/** Clear the session and send the user to login, returning here afterwards. */
export function redirectToLogin(): void {
  clearStoredToken();
  const here = `${window.location.pathname}${window.location.search}`;
  window.location.replace(loginUrl(here));
}

/** For data fetches: on a 401 the session is gone, so go to login. */
export function redirectIfUnauthorized(response: Response): boolean {
  if (response.status === 401) {
    redirectToLogin();
    return true;
  }
  return false;
}

/** Where to go after login: the ?next= page if it is a safe same-site path. */
export function getPostLoginPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/auth")) {
    return next;
  }
  return "/dashboard";
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/**
 * Sliding session: while the user is active, swap the access token for a fresh
 * one every few minutes so it never expires mid-use. Idle users still expire.
 * Returns a cleanup function.
 */
export function startSessionKeepAlive(): () => void {
  let active = true;
  let refreshing = false;

  const markActive = () => {
    active = true;
  };
  ACTIVITY_EVENTS.forEach((name) =>
    window.addEventListener(name, markActive, { passive: true }),
  );

  const timer = window.setInterval(async () => {
    const token = getStoredToken();
    if (!active || refreshing || !token || document.visibilityState === "hidden") {
      return;
    }
    refreshing = true;
    try {
      const response = await fetch(`${getApiBase()}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        if (data?.access_token) {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
          active = false;
        }
      }
    } catch {
      // Network blip: try again next tick.
    } finally {
      refreshing = false;
    }
  }, REFRESH_INTERVAL_MS);

  return () => {
    window.clearInterval(timer);
    ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, markActive));
  };
}
