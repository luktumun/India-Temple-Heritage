"use client";

import { useEffect } from "react";
import { ensureVisitorId } from "@/lib/portal-storage";

export function MetricTracker({ templeSlug }: { templeSlug?: string }) {
  useEffect(() => {
    const visitorId = ensureVisitorId();

    const track = (payload: Record<string, string | number>) => {
      fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, templeSlug, ...payload }),
        keepalive: true,
      }).catch((error: unknown) => {
        console.error("Unable to record portal metric.", error);
      });
    };

    track({ kind: "view" });
    let seconds = 0;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") seconds += 15;
    }, 15_000);
    const recordEngagement = () => {
      if (seconds > 0) {
        track({ kind: "engagement", seconds });
        seconds = 0;
      }
    };
    document.addEventListener("visibilitychange", recordEngagement);
    window.addEventListener("pagehide", recordEngagement);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", recordEngagement);
      window.removeEventListener("pagehide", recordEngagement);
      recordEngagement();
    };
  }, [templeSlug]);

  return null;
}
