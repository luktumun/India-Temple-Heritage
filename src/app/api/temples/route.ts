import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { findTemples, templeSlug } from "@/lib/temples";
import { isTempleInput } from "@/lib/temple-validation";
import Temple from "@/models/Temple";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const temples = await findTemples({
    q: params.get("q") ?? undefined,
    state: params.get("state") ?? undefined,
    city: params.get("city") ?? undefined,
  });
  return NextResponse.json({ temples });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!isTempleInput(body)) {
    return NextResponse.json({ error: "Temple name, state, and city are required." }, { status: 400 });
  }

  await connectToDatabase();
  const slug = templeSlug(body.name);
  const existing = await Temple.exists({ slug });
  if (existing) {
    return NextResponse.json({ error: "A temple with this name already exists." }, { status: 409 });
  }

  try {
    const temple = await Temple.create({ ...body, slug });
    return NextResponse.json({ slug: temple.slug }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "A temple with this name already exists." }, { status: 409 });
    }
    throw error;
  }
}
