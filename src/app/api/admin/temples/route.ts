import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { findTemples } from "@/lib/temples";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }
  return NextResponse.json({ temples: await findTemples() });
}
