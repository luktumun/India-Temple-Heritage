import type { TempleData } from "@/lib/temples";

const listFields = ["deity", "rituals", "festivals", "guidelines"] as const;
const textLimits: Record<string, number> = {
  name: 120,
  state: 80,
  city: 80,
  address: 300,
  history: 5000,
  darshanTimings: 300,
  imageUrl: 600,
  bestTimeToVisit: 160,
  entryFee: 120,
  contact: 160,
};

export type TempleInput = Partial<TempleData> & Pick<TempleData, "name" | "state" | "city">;

export function isTempleInput(value: unknown): value is TempleInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;

  if (
    typeof data.name !== "string" ||
    !data.name.trim() ||
    typeof data.state !== "string" ||
    !data.state.trim() ||
    typeof data.city !== "string" ||
    !data.city.trim()
  ) return false;

  for (const [field, maximum] of Object.entries(textLimits)) {
    if (data[field] !== undefined && (typeof data[field] !== "string" || data[field].length > maximum)) return false;
  }
  for (const field of listFields) {
    const list = data[field];
    if (list !== undefined && (
      !Array.isArray(list) ||
      list.length > 50 ||
      !list.every((item) => typeof item === "string" && item.length > 0 && item.length <= 200)
    )) return false;
  }
  if (data.featured !== undefined && typeof data.featured !== "boolean") return false;
  if (typeof data.imageUrl === "string" && data.imageUrl) {
    try {
      if (/["'\\\u0000-\u001f]/.test(data.imageUrl) || new URL(data.imageUrl).protocol !== "https:") return false;
    } catch {
      return false;
    }
  }
  return true;
}
