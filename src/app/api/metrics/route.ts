import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Metric, { type MetricKind } from "@/lib/metric";

const kinds: MetricKind[] = ["view", "search", "engagement", "rating"];

function isMetricKind(value: unknown): value is MetricKind {
  return typeof value === "string" && kinds.some((kind) => kind === value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid metrics event." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (
    !isMetricKind(body.kind) ||
    typeof body.visitorId !== "string" ||
    body.visitorId.length < 8 ||
    body.visitorId.length > 64 ||
    (body.kind === "search" && (typeof body.query !== "string" || typeof body.resultCount !== "number")) ||
    (body.kind === "engagement" && typeof body.seconds !== "number") ||
    (body.kind === "rating" &&
      (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating)))
  ) {
    return NextResponse.json({ error: "Invalid metrics event." }, { status: 400 });
  }

  await connectToDatabase();
  await Metric.create({
    kind: body.kind,
    visitorId: body.visitorId,
    templeSlug: typeof body.templeSlug === "string" ? body.templeSlug.slice(0, 120) : undefined,
    query: typeof body.query === "string" ? body.query.slice(0, 160) : undefined,
    resultCount: typeof body.resultCount === "number" ? Math.max(0, Math.min(body.resultCount, 100000)) : undefined,
    seconds: typeof body.seconds === "number" ? Math.max(0, Math.min(body.seconds, 86400)) : undefined,
    rating: body.rating,
  });
  return NextResponse.json({ recorded: true }, { status: 201 });
}
