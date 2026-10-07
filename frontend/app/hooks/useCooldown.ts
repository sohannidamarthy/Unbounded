"use client";

import { useCallback, useEffect, useState } from "react";

/** Counts down whole seconds after `start(seconds)`; `remaining` is 0 when idle. */
export function useCooldown() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (endsAt === null) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setEndsAt(null);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const start = useCallback((seconds: number) => {
    setEndsAt(Date.now() + Math.max(1, Math.ceil(seconds)) * 1000);
  }, []);

  return { remaining, start };
}

/** Seconds to wait from a 429 response (Retry-After header), with a fallback. */
export function retryAfterSeconds(response: Response, fallback = 60): number {
  const value = Number(response.headers.get("Retry-After"));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** 75 -> "1:15" */
export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
