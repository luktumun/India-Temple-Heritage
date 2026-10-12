"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Bookmark, Check, Share2 } from "lucide-react";
import { getSavedTemplesSnapshot, getVisitorIdSnapshot, readSavedTemples, subscribeToSavedTemples, subscribeToVisitorId, writeSavedTemples } from "@/lib/portal-storage";

export function SaveButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const savedSnapshot = useSyncExternalStore(subscribeToSavedTemples, getSavedTemplesSnapshot, () => "[]");
  const saved = useMemo(() => {
    try {
      const items: unknown = JSON.parse(savedSnapshot);
      return Array.isArray(items) && items.every((item) => typeof item === "string") ? items.includes(slug) : false;
    } catch {
      return false;
    }
  }, [savedSnapshot, slug]);

  function toggle() {
    const current = readSavedTemples();
    writeSavedTemples(saved ? current.filter((item) => item !== slug) : [...current, slug]);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Remove from saved temples" : "Save this temple"}
      aria-pressed={saved}
      className={`favorite-button inline-flex items-center justify-center gap-2 rounded-full border border-[#e7e2d8] bg-[#fffdfa] text-[#304438] ${compact ? "size-10" : "px-4 py-2.5 text-sm font-semibold"}`}
    >
      {saved ? <Check size={16} /> : <Bookmark size={16} />}
      {!compact && (saved ? "Saved" : "Save place")}
    </button>
  );
}

export function ShareButton({ title }: { title: string }) {
  const [shared, setShared] = useState(false);

  async function share() {
    const data = { title, text: `Explore ${title} on Sacred India`, url: window.location.href };
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(data.url);
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e7e2d8] px-4 py-2.5 text-sm font-semibold text-[#304438] transition hover:bg-[#f1eee7]"
    >
      {shared ? <Check size={16} /> : <Share2 size={16} />}
      {shared ? "Link copied" : "Share"}
    </button>
  );
}

export function SatisfactionRating({ slug }: { slug: string }) {
  const visitorId = useSyncExternalStore(subscribeToVisitorId, getVisitorIdSnapshot, () => "");
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(score: number) {
    setRating(score);
    const response = await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "rating", rating: score, templeSlug: slug, visitorId }),
    });
    if (!response.ok) throw new Error("Your feedback could not be saved.");
    setSent(true);
  }

  return (
    <div className="mt-6 rounded-2xl bg-[#f3f0e8] p-5">
      <p className="text-sm font-semibold text-[#26372e]">Was this guide helpful?</p>
      <div className="mt-3 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            aria-label={`Rate this guide ${score} out of 5`}
            disabled={!visitorId || sent}
            onClick={() => void submit(score).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to save your feedback."))}
            className={`size-9 rounded-full text-sm font-semibold transition ${rating >= score ? "bg-[#bd7a48] text-white" : "bg-white text-[#5e695e] hover:bg-[#eae4d9]"}`}
          >
            {score}
          </button>
        ))}
        {sent && <span className="ml-1 text-xs text-[#637563]">Thank you for sharing.</span>}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-[#9a473a]">{error}</p>}
    </div>
  );
}
