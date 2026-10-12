import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { hasAdminPassword, setAdminCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!hasAdminPassword()) {
    return NextResponse.json(
      { error: "Set a strong ADMIN_PASSWORD in .env.local before using the admin area." },
      { status: 503 },
    );
  }
  const body = await request.json();
  if (typeof body.password !== "string") {
    return NextResponse.json({ error: "Enter the admin password." }, { status: 400 });
  }

  const supplied = createHash("sha256").update(body.password).digest();
  const expected = createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest();
  if (!timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "That password did not match." }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const secure = requestUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  await setAdminCookie(secure);
  return NextResponse.json({ authenticated: true });
}
