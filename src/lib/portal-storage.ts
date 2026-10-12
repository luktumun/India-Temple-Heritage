"use client";

const visitorKey = "sacred-india-visitor";
const savedKey = "sacred-india-saved-temples";
const visitorEvent = "sacred-india-visitor-change";
const savedEvent = "sacred-india-saved-change";

function createVisitorId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getVisitorIdSnapshot() {
  return typeof window === "undefined" ? "" : localStorage.getItem(visitorKey) ?? "";
}

export function ensureVisitorId() {
  let visitorId = getVisitorIdSnapshot();
  if (!visitorId) {
    visitorId = createVisitorId();
    localStorage.setItem(visitorKey, visitorId);
    window.dispatchEvent(new Event(visitorEvent));
  }
  return visitorId;
}

export function subscribeToVisitorId(callback: () => void) {
  window.addEventListener(visitorEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(visitorEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getSavedTemplesSnapshot() {
  return typeof window === "undefined" ? "[]" : localStorage.getItem(savedKey) ?? "[]";
}

export function readSavedTemples() {
  try {
    const saved: unknown = JSON.parse(getSavedTemplesSnapshot());
    return Array.isArray(saved) && saved.every((item) => typeof item === "string") ? saved as string[] : [];
  } catch {
    return [];
  }
}

export function writeSavedTemples(saved: string[]) {
  localStorage.setItem(savedKey, JSON.stringify(saved));
  window.dispatchEvent(new Event(savedEvent));
}

export function subscribeToSavedTemples(callback: () => void) {
  window.addEventListener(savedEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(savedEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
