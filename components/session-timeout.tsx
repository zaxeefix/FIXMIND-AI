"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, LogOut, ShieldCheck } from "lucide-react";
import type { AuthenticatedRole } from "@/lib/permissions";

const IDLE_LIMIT_MS = 3 * 60 * 1000;
const WARNING_MS = 30 * 1000;
const REFRESH_INTERVAL_MS = 30 * 1000;
const loginFor = (role: AuthenticatedRole) => role === "admin" ? "/admin/login" : role === "technician" ? "/technician/login" : "/login";

export function SessionTimeout({ role }: { role: AuthenticatedRole }) {
  const [warning, setWarning] = useState(false);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefresh = useRef(0);
  const expiring = useRef(false);
  const warningVisible = useRef(false);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  }, []);

  const clearClientSession = useCallback(() => {
    sessionStorage.clear();
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key?.startsWith("fixmind-session")) localStorage.removeItem(key);
    }
  }, []);

  const expire = useCallback(async () => {
    if (expiring.current) return;
    expiring.current = true;
    clearTimers();
    clearClientSession();
    try { await fetch("/api/session", { method: "DELETE", cache: "no-store" }); } catch { /* Cookie expiry remains the server-side backstop. */ }
    window.location.replace(`${loginFor(role)}?reason=inactive`);
  }, [clearClientSession, clearTimers, role]);

  const schedule = useCallback(() => {
    clearTimers();
    warningVisible.current = false;
    setWarning(false);
    warningTimer.current = setTimeout(() => { warningVisible.current = true; setWarning(true); }, IDLE_LIMIT_MS - WARNING_MS);
    logoutTimer.current = setTimeout(expire, IDLE_LIMIT_MS);
  }, [clearTimers, expire]);

  const refreshServerSession = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefresh.current < REFRESH_INTERVAL_MS) return;
    lastRefresh.current = now;
    const response = await fetch("/api/session", { method: "PATCH", cache: "no-store" });
    if (response.status === 401) await expire();
  }, [expire]);

  const staySignedIn = useCallback(async () => {
    await refreshServerSession();
    schedule();
  }, [refreshServerSession, schedule]);

  useEffect(() => {
    const activity = () => {
      if (warningVisible.current || expiring.current) return;
      schedule();
      void refreshServerSession();
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "scroll", "popstate", "pageshow"];
    events.forEach(event => window.addEventListener(event, activity, { passive: true }));
    schedule();
    void refreshServerSession();
    return () => { events.forEach(event => window.removeEventListener(event, activity)); clearTimers(); };
  }, [clearTimers, refreshServerSession, schedule]);

  if (!warning) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" role="presentation">
    <section role="alertdialog" aria-modal="true" aria-labelledby="session-expiry-title" aria-describedby="session-expiry-copy" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><Clock3 /></span>
      <h2 id="session-expiry-title" className="mt-5 mb-2 text-2xl font-bold">Your session is about to expire</h2>
      <p id="session-expiry-copy" className="mt-0 leading-7 text-slate-600 dark:text-slate-300">Your session will expire due to inactivity. Stay signed in?</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button autoFocus onClick={staySignedIn} className="btn btn-primary"><ShieldCheck size={17}/>Stay Signed In</button>
        <button onClick={expire} className="btn btn-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-white"><LogOut size={17}/>Log Out</button>
      </div>
    </section>
  </div>;
}
