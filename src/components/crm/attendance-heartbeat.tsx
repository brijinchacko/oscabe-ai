"use client";

import { useEffect, useRef, useCallback } from "react";

interface AttendanceHeartbeatProps {
  hasActiveSession: boolean;
}

/**
 * Bulletproof attendance heartbeat.
 *
 * The ONLY scenario we can reliably detect as "idle" is:
 *   - CRM tab is visible
 *   - CRM browser window has focus (it's the frontmost OS application)
 *   - No mouse/keyboard/touch activity in the tab for 60+ continuous minutes
 *
 * In ALL other cases (tab hidden, window blurred, working in Excel/Gmail/Teams,
 * second monitor focused, etc.) we MUST report the user as active. We have no
 * way to tell from a hidden tab whether the laptop is being used or not.
 *
 * To avoid relying on `document.hasFocus()` (which has known quirks across
 * browsers and OSs), we track focus and visibility via explicit `focus`/`blur`/
 * `visibilitychange` events and store the state in refs.
 */
export function AttendanceHeartbeat({ hasActiveSession }: AttendanceHeartbeatProps) {
  const IDLE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

  const lastActivityRef = useRef<number>(Date.now());
  const sendingRef = useRef(false);
  // Initialise from the live state at mount so we don't have a 1-frame
  // window where we falsely think the tab is hidden / unfocused.
  const isVisibleRef = useRef<boolean>(
    typeof document === "undefined" ? true : document.visibilityState === "visible"
  );
  const hasFocusRef = useRef<boolean>(
    typeof document === "undefined"
      ? true
      : typeof document.hasFocus === "function"
        ? document.hasFocus()
        : true
  );

  const markActive = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const computeIsActive = useCallback((forceActive: boolean): boolean => {
    if (forceActive) return true;

    // Hidden tab → user is using another tab/app → assume active.
    if (!isVisibleRef.current) return true;
    // Unfocused window → another OS application has focus → assume active.
    if (!hasFocusRef.current) return true;

    // CRM tab is the visible, frontmost window.
    // Only now is "no in-tab activity" a meaningful signal of idleness.
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    return timeSinceLastActivity < IDLE_THRESHOLD_MS;
  }, [IDLE_THRESHOLD_MS]);

  const sendHeartbeat = useCallback(async (forceActive?: boolean) => {
    if (sendingRef.current) return;
    sendingRef.current = true;

    const isActive = computeIsActive(!!forceActive);

    try {
      await fetch("/api/attendance/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
    } catch {
      // silently fail
    } finally {
      sendingRef.current = false;
    }
  }, [computeIsActive]);

  useEffect(() => {
    if (!hasActiveSession) return;

    // ── User-input listeners (only fire when tab is foreground+focused) ──
    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);
    window.addEventListener("click", markActive);
    window.addEventListener("scroll", markActive);
    window.addEventListener("touchstart", markActive);

    // ── Visibility tracking ──
    function handleVisibilityChange() {
      const visible = document.visibilityState === "visible";
      isVisibleRef.current = visible;
      if (visible) {
        // Returning to the tab counts as activity.
        markActive();
        sendHeartbeat(true);
      } else {
        // Leaving the tab — proactively let the server know we're "still here,
        // just elsewhere" so the lastActiveHeartbeat timestamp is fresh.
        sendHeartbeat(true);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ── Focus / blur tracking on the window (more reliable than document.hasFocus) ──
    function handleFocus() {
      hasFocusRef.current = true;
      markActive();
      sendHeartbeat(true);
    }
    function handleBlur() {
      hasFocusRef.current = false;
      // Window just lost focus → user switched to another app → still active.
      sendHeartbeat(true);
    }
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Some browsers fire pageshow on bfcache restore — treat as activity.
    function handlePageShow() {
      isVisibleRef.current = document.visibilityState === "visible";
      markActive();
      sendHeartbeat(true);
    }
    window.addEventListener("pageshow", handlePageShow);

    // Periodic heartbeat
    const interval = setInterval(() => sendHeartbeat(), 60000);

    // Initial heartbeat
    sendHeartbeat(true);

    return () => {
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("click", markActive);
      window.removeEventListener("scroll", markActive);
      window.removeEventListener("touchstart", markActive);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pageshow", handlePageShow);
      clearInterval(interval);
    };
  }, [hasActiveSession, markActive, sendHeartbeat]);

  return null;
}
