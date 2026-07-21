"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), portal: "customer" }) });
      const result = await response.json() as { error?: string; home?: string; role?: string };
      if (!response.ok || result.role !== "customer" || result.home !== "/dashboard") { setError(result.error || "This account does not have customer portal access."); return; }
      router.replace("/dashboard"); router.refresh();
    } catch { setError("Sign in is temporarily unavailable. Please try again."); } finally { setPending(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5 dark:bg-slate-950"><section className="card w-full max-w-md bg-white shadow-xl dark:bg-slate-900"><Logo/><p className="eyebrow mt-8">Customer portal</p><h1 className="h1 mb-2 mt-2 font-bold">Welcome back</h1><p className="muted">Sign in to access diagnoses, bookings, and repair history.</p><form onSubmit={submit} className="mt-7 grid gap-5" aria-label="customer sign in"><label><span className="label">Email</span><input className="input" name="email" type="email" autoComplete="email" required/></label><label><span className="label">Password</span><input className="input" name="password" type="password" autoComplete="current-password" required minLength={8}/></label>{error && <p role="alert" className="m-0 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}<button disabled={pending} className="btn btn-primary w-full">{pending ? "Signing in…" : "Sign in as customer"}</button></form><p className="mt-5 text-center text-sm text-slate-500">New customer? <Link href="/signup" className="font-semibold text-blue-600">Create a free account</Link></p><div className="mt-4 flex flex-wrap justify-center gap-4 text-sm"><Link href="/resources" className="text-slate-500">Browse free resources</Link><Link href="/" className="text-slate-500">Return home</Link></div></section></main>;
}
