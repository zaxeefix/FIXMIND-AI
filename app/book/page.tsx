"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, MapPin, Wrench } from "lucide-react";
import { Logo, Stepper } from "@/components/ui";
import { createBooking } from "./actions";

type Profile = { email?: string; name?: string; phone?: string; address?: string };

export default function Book() {
  const [state, action, pending] = useActionState(createBooking, { error: "" });
  const [method, setMethod] = useState("Walk-in");
  const [prefilled, setPrefilled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const populate = (values: Record<string, string | undefined>) => Object.entries(values).forEach(([name, value]) => {
      const field = formRef.current?.elements.namedItem(name);
      if (value && (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) && !field.value) field.value = value;
    });
    try {
      const draft = JSON.parse(sessionStorage.getItem("fixmind-diagnosis-draft") || "{}") as Record<string, string>;
      populate({ deviceCategory: draft.deviceCategory, brand: draft.brand, deviceModel: draft.deviceModel, service: draft.problemCategory ? `${draft.problemCategory} repair` : undefined, notes: draft.description });
      void fetch("/api/customer/profile", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then((profile: Profile | null) => {
        if (!profile) return;
        populate({ customerEmail: profile.email, customerName: profile.name, phone: profile.phone, address: profile.address });
        setPrefilled(Boolean(profile.email || profile.name || profile.phone));
      });
    } catch { /* The form remains fully editable when no reusable data exists. */ }
  }, []);

  return <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
    <header className="border-b border-slate-200 dark:border-slate-800"><div className="container flex h-[72px] items-center justify-between"><Logo/><Link href="/dashboard" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Save & exit</Link></div></header>
    <div className="border-b border-slate-200 bg-slate-50 py-7 dark:border-slate-800 dark:bg-slate-900"><div className="container"><Stepper current={4}/></div></div>
    <section className="container py-12"><form ref={formRef} action={action} className="mx-auto max-w-3xl">
      <p className="eyebrow">Diagnosis to repair</p><h1 className="h1 mt-2 font-bold">Review and book your repair</h1>
      <p className="muted">Your account and latest diagnosis details are carried forward automatically. Everything remains editable.</p>
      {prefilled && <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">We prefilled your saved customer details to make booking faster.</p>}
      <div className="card mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="customerName" autoComplete="name"/><Field label="Email" name="customerEmail" type="email" autoComplete="email"/><Field label="Phone" name="phone" type="tel" autoComplete="tel"/>
        <label><span className="label">Device category</span><select className="input" name="deviceCategory" required><option>Smartphone</option><option>Tablet</option><option>Laptop</option><option>Smartwatch</option></select></label>
        <Field label="Brand" name="brand" placeholder="Apple"/><Field label="Device model" name="deviceModel" placeholder="iPhone 15 Pro"/><Field label="Service" name="service" placeholder="Battery replacement"/>
        <label><span className="label">Service option</span><select className="input" name="fulfillmentMethod" value={method} onChange={event => setMethod(event.target.value)}><option>Walk-in</option><option>Pickup</option></select></label>
        <label><span className="label">Repair location</span>{method === "Pickup" ? <><input type="hidden" name="location" value="Customer pickup"/><span className="input flex items-center text-slate-500 dark:text-slate-300">Collected from your address</span></> : <select className="input" name="location" required><option>FixMind Downtown</option><option>FixMind Central</option></select>}</label>
        <label><span className="label">Pickup address <span className="font-normal text-slate-400">{method === "Pickup" ? "(required)" : "(saved for later)"}</span></span><input className="input" name="address" autoComplete="street-address" required={method === "Pickup"} placeholder="Street, city, postal code"/></label>
        <label className="sm:col-span-2"><span className="label">Preferred appointment</span><input className="input" name="appointmentAt" type="datetime-local" required/></label>
        <label className="sm:col-span-2"><span className="label">Fault description or additional notes <span className="font-normal text-slate-400">(optional)</span></span><textarea className="input min-h-28" name="notes" maxLength={1000}/></label>
        {state.error && <p role="alert" className="sm:col-span-2 m-0 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{state.error}</p>}
      </div>
      <div className="card mt-5 flex flex-col gap-4 bg-blue-50/50 dark:bg-blue-950/30 sm:flex-row sm:items-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-300">{method === "Pickup" ? <MapPin/> : <Wrench/>}</span><div className="flex-1"><b>Repair summary ready</b><p className="muted m-0 text-sm">Final parts and price are confirmed after technician inspection.</p></div><b className="text-xl">$99 estimate</b></div>
      <button disabled={pending} className="btn btn-primary mt-6 w-full sm:w-auto">{pending ? "Confirming…" : "Confirm booking"}<CheckCircle2 size={17}/></button>
    </form></section>
  </main>;
}

function Field({ label, name, type = "text", placeholder, autoComplete }: { label: string; name: string; type?: string; placeholder?: string; autoComplete?: string }) {
  return <label><span className="label">{label}</span><input className="input" name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required/></label>;
}
