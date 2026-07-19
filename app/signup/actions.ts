"use server";
import { redirect } from "next/navigation";
import { createSession, registerCustomerAccount } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function signup(_: { error: string }, form: FormData) {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const name = String(form.get("name") || "").trim();
  const password = String(form.get("password") || "");
  if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 2 || password.length < 8) return { error: "Enter your name, a valid email, and a password with at least 8 characters." };
  if (!rateLimit(`signup:${email}`, 3, 60 * 60_000).allowed) return { error: "Too many signup attempts. Please try again later." };
  try {
    await registerCustomerAccount(email, password);
    await createSession(email, "customer");
  } catch {
    return { error: "Account creation is temporarily unavailable. Please check the authentication configuration and try again." };
  }
  redirect("/diagnose");
}
