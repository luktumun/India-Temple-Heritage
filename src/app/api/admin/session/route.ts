import { NextResponse } from "next/server";
import { connection } from "next/server";
import { hasAdminPassword, isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  await connection();
  return NextResponse.json({
    configured: hasAdminPassword(),
    authenticated: await isAdminAuthenticated(),
  });
}
