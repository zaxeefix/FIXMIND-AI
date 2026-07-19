import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/lib/env";
import { roleHome, type AuthenticatedRole } from "@/lib/permissions";

export type Session = { email: string; role: AuthenticatedRole; expiresAt: number };
type CustomerCredential = { email: string; salt: string; passwordHash: string };

const COOKIE = "fixmind_session";
const ACCOUNT_COOKIE = "fixmind_customer";
const DEVELOPMENT_SECRET = "fixmind-local-development-secret-change-before-production";

function authSecret() {
  const configured = getServerEnv().AUTH_SECRET;
  if (configured) return configured;
  return process.env.NODE_ENV === "production" ? null : DEVELOPMENT_SECRET;
}

function signature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function signedPayload(value: object, secret: string) {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

function verifyPayload<T>(token: string, secret: string): T | null {
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  const expected = signature(payload, secret);
  if (expected.length !== supplied.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) return null;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()) as T; } catch { return null; }
}

export async function getSession(): Promise<Session | null> {
  const secret = authSecret();
  if (!secret) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = verifyPayload<Session>(token, secret);
  return session && session.expiresAt > Date.now() ? session : null;
}

export async function createSession(email: string, role: Session["role"]) {
  const secret = authSecret();
  if (!secret) throw new Error("Authentication is unavailable. Configure AUTH_SECRET and restart the server.");
  const value = signedPayload({ email, role, expiresAt: Date.now() + 604_800_000 }, secret);
  (await cookies()).set(COOKIE, value, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604_800 });
}

export async function registerCustomerAccount(email: string, password: string) {
  const secret = authSecret();
  if (!secret) throw new Error("Authentication is unavailable. Configure AUTH_SECRET and restart the server.");
  const salt = randomBytes(16).toString("hex");
  const credential: CustomerCredential = { email, salt, passwordHash: scryptSync(password, salt, 32).toString("base64url") };
  (await cookies()).set(ACCOUNT_COOKIE, signedPayload(credential, secret), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 2_592_000 });
}

export async function verifyRegisteredCustomer(email: string, password: string) {
  const secret = authSecret();
  if (!secret) return false;
  const token = (await cookies()).get(ACCOUNT_COOKIE)?.value;
  if (!token) return false;
  const credential = verifyPayload<CustomerCredential>(token, secret);
  if (!credential || credential.email !== email) return false;
  const actual = scryptSync(password, credential.salt, 32).toString("base64url");
  return actual.length === credential.passwordHash.length && timingSafeEqual(Buffer.from(actual), Buffer.from(credential.passwordHash));
}

export async function requireSession(role?: Session["role"] | Session["role"][]) {
  const session = await getSession();
  if (!session) redirect("/login");
  const allowed = Array.isArray(role) ? role : role ? [role] : null;
  if (allowed && !allowed.includes(session.role)) redirect(roleHome(session.role));
  return session;
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
