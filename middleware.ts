import { NextRequest, NextResponse } from "next/server";

type SessionRole = "customer" | "technician" | "admin";
type SessionPayload = { email: string; role: SessionRole; expiresAt: number };
const sessionCookie = "fixmind_session";
const developmentSecret = "fixmind-local-development-secret-change-before-production";

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}

async function verifiedSession(token: string | undefined): Promise<SessionPayload | null> {
  const secret = process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : developmentSecret);
  if (!token || !secret) return null;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
    const actual = decodeBase64Url(supplied);
    if (expected.length !== actual.length || expected.some((value, index) => value !== actual[index])) return null;
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as SessionPayload;
    if (!session.email || !["customer", "technician", "admin"].includes(session.role) || session.expiresAt <= Date.now()) return null;
    return session;
  } catch { return null; }
}

function destinationFor(role: SessionRole | null, pathname: string) {
  if (role === "admin") return "/admin";
  if (role === "technician") return "/technician";
  if (role === "customer") return "/dashboard";
  return pathname.startsWith("/admin") ? "/admin/login" : pathname.startsWith("/technician") ? "/technician/login" : "/login";
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/technician/login") return NextResponse.next();
  const requiredRole: SessionRole | null = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/technician") ? "technician" : pathname.startsWith("/dashboard") || pathname.startsWith("/book") ? "customer" : null;
  if (!requiredRole) return NextResponse.next();
  const session = await verifiedSession(request.cookies.get(sessionCookie)?.value);
  if (session?.role === requiredRole) return NextResponse.next();

  const redirectUrl = new URL(destinationFor(session?.role || null, pathname), request.url);
  if (!session) redirectUrl.searchParams.set("next", `${pathname}${search}`);
  const response = NextResponse.redirect(redirectUrl);
  if (!session && request.cookies.has(sessionCookie)) response.cookies.delete(sessionCookie);
  return response;
}

export const config = { matcher: ["/admin/:path*", "/technician/:path*", "/dashboard/:path*", "/book/:path*"] };
