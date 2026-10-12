import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "temple-admin";
const cookieValue = () =>
  createHmac("sha256", process.env.ADMIN_PASSWORD ?? "")
    .update("india-temple-heritage-admin")
    .digest("hex");

export function hasAdminPassword() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_PASSWORD.length >= 16 &&
      process.env.ADMIN_PASSWORD !== "change-this-before-deploying",
  );
}

export async function isAdminAuthenticated() {
  if (!hasAdminPassword()) return false;
  const current = (await cookies()).get(cookieName)?.value ?? "";
  const expected = cookieValue();
  const currentBuffer = Buffer.from(current);
  const expectedBuffer = Buffer.from(expected);
  return currentBuffer.length === expectedBuffer.length && timingSafeEqual(currentBuffer, expectedBuffer);
}

export async function setAdminCookie(secure: boolean) {
  (await cookies()).set(cookieName, cookieValue(), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(cookieName);
}
