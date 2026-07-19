import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyRegisteredCustomer } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { roleHome, type AuthenticatedRole } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const portal = body.portal === "admin" || body.portal === "technician" || body.portal === "customer" ? body.portal as AuthenticatedRole : null;
    if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    if (!rateLimit(`login:${email}`, 8, 15 * 60_000).allowed) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

    const env = getServerEnv();
    let role: AuthenticatedRole | null = null;
    if (email === env.ADMIN_EMAIL.toLowerCase() && password === env.ADMIN_PASSWORD) role = "admin";
    else if (email === env.TECHNICIAN_EMAIL.toLowerCase() && password === env.TECHNICIAN_PASSWORD) role = "technician";
    else if (email === env.DEMO_USER_EMAIL.toLowerCase() && password === env.DEMO_USER_PASSWORD) role = "customer";
    else if (await verifyRegisteredCustomer(email, password)) role = "customer";

    if (!role || (portal && role !== portal)) return NextResponse.json({ error: "Email or password is incorrect for this portal." }, { status: 401 });
    await createSession(email, role);
    return NextResponse.json({ ok: true, role, home: roleHome(role) });
  } catch (error) {
    console.error("FixMind login failure", error instanceof Error ? error.message : "Unknown authentication error");
    return NextResponse.json({ error: "Sign in is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
