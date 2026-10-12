import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { findTemple, templeSlug } from "@/lib/temples";
import { isTempleInput } from "@/lib/temple-validation";
import Temple from "@/models/Temple";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const temple = await findTemple(slug);
  if (!temple) return NextResponse.json({ error: "Temple not found." }, { status: 404 });
  return NextResponse.json({ temple });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }
  const { slug } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!isTempleInput(body)) return NextResponse.json({ error: "Temple name, state, and city are required." }, { status: 400 });

  await connectToDatabase();
  let updated;
  try {
    updated = await Temple.findOneAndUpdate(
      { slug },
      { ...body, slug: templeSlug(body.name) },
      { new: true, runValidators: true },
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "A temple with this name already exists." }, { status: 409 });
    }
    throw error;
  }
  if (!updated) return NextResponse.json({ error: "Temple not found." }, { status: 404 });
  return NextResponse.json({ slug: updated.slug });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }
  const { slug } = await params;
  await connectToDatabase();
  const deleted = await Temple.findOneAndDelete({ slug });
  if (!deleted) return NextResponse.json({ error: "Temple not found." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
