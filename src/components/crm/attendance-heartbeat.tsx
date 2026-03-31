"use client";

import { useEffect, useRef, useCallback } from "react";

interface AttendanceHeartbeatProps {
  hasActiveSession: boolean;
}

export function AttendanceHeartbeat({ hasActiveSession }: AttendanceHeartbeatProps) {
  const hasActivityRef = useRef(false);

  const markActive = useCallback(() => {
    hasActivityRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasActiveSession) return;

    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);
    window.addEventListener("click", markActive);
    window.addEventListener("scroll", markActive);

    const interval = setInterval(async () => {
      const isActive = hasActivityRef.current;
      hasActivityRef.current = false;

      try {
        await fetch("/api/attendance/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });
      } catch {
        // silently fail
      }
    }, 60000);

    return () => {
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("click", markActive);
      window.removeEventListener("scroll", markActive);
      clearInterval(interval);
    };
  }, [hasActiveSession, markActive]);

  return null;
}
