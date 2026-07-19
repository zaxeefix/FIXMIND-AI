"use client";

import { FormEvent, type ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui";
import type { AuthenticatedRole } from "@/lib/permissions";

export function RoleLogin({ role, eyebrow, title, copy, icon }: { role: AuthenticatedRole; eyebrow: string; title: string; copy: string; icon: ReactNode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), portal: role }),
      });
      const result = await response.json() as { error?: string; home?: string; role?: AuthenticatedRole };
      if (!response.ok || result.role !== role || !result.home) {
        setError(result.error || "Sign in failed.");
        return;
      }
      router.replace(result.home);
      router.refresh();
    } catch {
      setError("Secure sign in is temporarily unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#2563eb66,transparent_34%),radial-gradient(circle_at_85%_75%,#06b6d433,transparent_32%)]" />
        <div className="relative"><Logo inverse /></div>
        <div className="relative max-w-xl">
          <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-cyan-300">{icon}</span>
          <p className="eyebrow !text-cyan-300">Restricted workspace</p>
          <h1 className="display my-4 font-bold">Purpose-built access for every repair role.</h1>
          <p className="m-0 text-lg leading-8 text-slate-300">Signed sessions, role verification, and protected server routes keep operational data separated from the public experience.</p>
        </div>
        <p className="relative text-xs text-slate-500">FixMind AI · Secure operations</p>
      </section>
      <section className="grid place-items-center bg-slate-50 p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">{icon}</span>
          <p className="eyebrow mt-7">{eyebrow}</p>
          <h2 className="h1 my-2 font-bold">{title}</h2>
          <p className="m-0 leading-7 text-slate-600">{copy}</p>
          <form onSubmit={submit} className="mt-8 grid gap-5" aria-label={`${role} sign in`}>
            <label><span className="label">Work email</span><input className="input" name="email" type="email" autoComplete="username" required /></label>
            <label><span className="label">Password</span><input className="input" name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
            {error && <p role="alert" className="m-0 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={pending} className="btn btn-primary w-full"><LockKeyhole size={17} />{pending ? "Verifying access…" : "Sign in securely"}</button>
          </form>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-white p-3 text-xs leading-5 text-slate-500"><ShieldCheck className="shrink-0 text-green-600" size={17} />Access attempts are rate-limited and credentials remain server-side.</div>
          <div className="mt-6 flex justify-between text-sm"><Link href="/login" className="text-slate-500">Customer sign in</Link><Link href="/" className="font-semibold text-blue-600">Return home</Link></div>
        </div>
      </section>
    </main>
  );
}
