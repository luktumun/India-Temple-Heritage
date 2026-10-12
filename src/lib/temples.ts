import { connectToDatabase } from "@/lib/mongodb";
import Temple, { type TempleDocument } from "@/models/Temple";

export type TempleData = {
  name: string;
  slug: string;
  state: string;
  city: string;
  address: string;
  deity: string[];
  history: string;
  darshanTimings: string;
  rituals: string[];
  festivals: string[];
  guidelines: string[];
  imageUrl: string;
  bestTimeToVisit: string;
  entryFee: string;
  contact: string;
  featured: boolean;
};

export function serializeTemple(temple: TempleDocument): TempleData {
  return {
    name: temple.name,
    slug: temple.slug,
    state: temple.state,
    city: temple.city,
    address: temple.address,
    deity: temple.deity,
    history: temple.history,
    darshanTimings: temple.darshanTimings,
    rituals: temple.rituals,
    festivals: temple.festivals,
    guidelines: temple.guidelines,
    imageUrl: temple.imageUrl,
    bestTimeToVisit: temple.bestTimeToVisit,
    entryFee: temple.entryFee,
    contact: temple.contact,
    featured: temple.featured,
  };
}

export function templeSlug(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

export async function findTemples(filters: {
  q?: string;
  state?: string;
  city?: string;
} = {}) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};

  if (filters.q?.trim()) {
    const escaped = filters.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    query.$or = [
      { name: pattern },
      { city: pattern },
      { state: pattern },
      { deity: pattern },
      { festivals: pattern },
    ];
  }
  if (filters.state) query.state = filters.state;
  if (filters.city) query.city = filters.city;

  const temples = await Temple.find(query).sort({ featured: -1, name: 1 }).lean();
  return temples.map((temple) => serializeTemple(temple as TempleDocument));
}

export async function findTemple(slug: string) {
  await connectToDatabase();
  const temple = await Temple.findOne({ slug }).lean();
  return temple ? serializeTemple(temple as TempleDocument) : null;
}
