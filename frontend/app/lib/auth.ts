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
