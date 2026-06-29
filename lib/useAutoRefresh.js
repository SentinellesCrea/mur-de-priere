"use client";

import { useEffect, useRef } from "react";

export const SUPERVISOR_DATA_REFRESH_EVENT = "supervisor:data-refresh";
export const VOLUNTEER_DATA_REFRESH_EVENT = "volunteer:data-refresh";

export function notifySupervisorDataChanged(detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SUPERVISOR_DATA_REFRESH_EVENT, { detail }));
}

export function useAutoRefresh(
  callback,
  {
    enabled = true,
    intervalMs = 8000,
    eventName = SUPERVISOR_DATA_REFRESH_EVENT,
  } = {}
) {
  const callbackRef = useRef(callback);
  const isRunningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const run = async () => {
      if (isRunningRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      try {
        isRunningRef.current = true;
        await callbackRef.current?.();
      } catch (error) {
        console.error("Erreur rafraîchissement automatique :", error.message);
      } finally {
        isRunningRef.current = false;
      }
    };

    const interval = window.setInterval(run, intervalMs);
    const handleFocus = () => run();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") run();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener(eventName, handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(eventName, handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, eventName, intervalMs]);
}
