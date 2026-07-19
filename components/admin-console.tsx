"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { updateBookingOperation } from "@/app/admin/actions";

export type ChartPoint = { label: string; value: number };
export type BookingOperation = {
  id: string;
  device: string;
  service: string;
  customer: string;
  email: string;
  appointment: string;
  status: string;
  technician: string;
  total: string;
};

export function OperationsCharts({ daily, brands, faults, statuses }: { daily: ChartPoint[]; brands: ChartPoint[]; faults: ChartPoint[]; statuses: ChartPoint[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <LineChart title="Daily AI diagnoses" points={daily} />
      <BarChart title="Top device brands" points={brands} />
      <BarChart title="Most common device faults" points={faults} />
      <BarChart title="Repair status distribution" points={statuses} />
    </div>
  );
}

function LineChart({ title, points }: { title: string; points: ChartPoint[] }) {
  const max = Math.max(1, ...points.map(point => point.value));
  const coordinates = points.map((point, index) => `${(index / Math.max(1, points.length - 1)) * 100},${92 - (point.value / max) * 72}`).join(" ");
  return (
    <section className="card min-w-0">
      <div className="mb-6 flex items-center justify-between"><h3 className="m-0 text-base font-semibold">{title}</h3><span className="badge badge-blue">Last 7 days</span></div>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${title} chart`} className="h-48 w-full overflow-visible" preserveAspectRatio="none">
        {[20,44,68,92].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e2e8f0" strokeWidth=".5" />)}
        <polyline points={coordinates} fill="none" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((point,index)=><circle key={point.label} cx={(index/Math.max(1,points.length-1))*100} cy={92-(point.value/max)*72} r="1.5" fill="#06b6d4" />)}
      </svg>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500">{points.map(point=><span key={point.label}>{point.label}<b className="mt-1 block text-slate-800">{point.value}</b></span>)}</div>
    </section>
  );
}

function BarChart({ title, points }: { title: string; points: ChartPoint[] }) {
  const max = Math.max(1, ...points.map(point => point.value));
  return (
    <section className="card">
      <h3 className="mt-0 mb-6 text-base font-semibold">{title}</h3>
      <div className="grid gap-4">{points.length ? points.slice(0,5).map(point=><div key={point.label}><div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="truncate text-slate-600">{point.label}</span><b>{point.value}</b></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{width:`${Math.max(6,(point.value/max)*100)}%`}} /></div></div>):<p className="py-12 text-center text-sm text-slate-500">Data appears after platform activity begins.</p>}</div>
    </section>
  );
}

export function BookingOperations({ rows, technicianEmail }: { rows: BookingOperation[]; technicianEmail: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const filtered = useMemo(() => rows.filter(row => (status === "All" || row.status === status) && `${row.device} ${row.customer} ${row.email} ${row.service}`.toLowerCase().includes(query.toLowerCase())), [rows, query, status]);
  const exportCsv = () => {
    const lines = [["Ticket","Device","Service","Customer","Email","Appointment","Status","Technician","Estimate"],...filtered.map(row=>[row.id,row.device,row.service,row.customer,row.email,row.appointment,row.status,row.technician,row.total])];
    const csv = lines.map(line=>line.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    const anchor = document.createElement("a");anchor.href=url;anchor.download="fixmind-bookings.csv";anchor.click();URL.revokeObjectURL(url);
  };
  return (
    <section id="bookings" className="card scroll-mt-24 overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="eyebrow mb-1">Operations queue</p><h2 className="m-0 text-xl font-semibold">Booking management</h2></div>
        <div className="flex flex-col gap-2 sm:flex-row"><label className="flex min-h-11 items-center gap-2 rounded-xl border bg-slate-50 px-3"><Search size={16}/><span className="sr-only">Search bookings</span><input value={query} onChange={event=>setQuery(event.target.value)} className="min-w-0 bg-transparent text-sm outline-none" placeholder="Search bookings" /></label><select aria-label="Filter booking status" value={status} onChange={event=>setStatus(event.target.value)} className="rounded-xl border bg-white px-3 text-sm">{["All","Booked","Approved","Received","Diagnosing","In repair","Ready","Completed","Rejected"].map(value=><option key={value}>{value}</option>)}</select><button onClick={exportCsv} className="btn btn-secondary !h-11"><Download size={16}/>Export CSV</button></div>
      </div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr>{["Ticket","Device","Customer","Appointment","Assignment","Status","Estimate","Action"].map(label=><th className="border-b px-2 py-3 text-xs uppercase tracking-wide text-slate-500" key={label}>{label}</th>)}</tr></thead><tbody>{filtered.map(row=><tr key={row.id}><td className="border-b px-2 py-4 font-mono text-xs">{row.id.slice(-8).toUpperCase()}</td><td className="border-b px-2"><b className="block">{row.device}</b><small className="text-slate-500">{row.service}</small></td><td className="border-b px-2">{row.customer}<small className="block text-slate-500">{row.email}</small></td><td className="border-b px-2 text-xs">{row.appointment}</td><td className="border-b px-2"><form id={`operation-${row.id}`} action={updateBookingOperation}><input type="hidden" name="id" value={row.id}/><select aria-label={`Technician for ${row.device}`} name="assignedTechnicianEmail" defaultValue={row.technician} className="rounded-lg border bg-white p-2 text-xs"><option value="">Unassigned</option><option value={technicianEmail}>{technicianEmail}</option></select></form></td><td className="border-b px-2"><select form={`operation-${row.id}`} aria-label={`Status for ${row.device}`} name="status" defaultValue={row.status} className="rounded-lg border bg-white p-2 text-xs">{["Booked","Approved","Received","Diagnosing","In repair","Ready","Completed","Rejected"].map(value=><option key={value}>{value}</option>)}</select></td><td className="border-b px-2 font-semibold">{row.total}</td><td className="border-b px-2"><button form={`operation-${row.id}`} className="btn btn-primary !h-9 !rounded-lg !px-3 text-xs">Save</button></td></tr>)}</tbody></table>{!filtered.length&&<p className="py-10 text-center text-sm text-slate-500">No bookings match the current filters.</p>}</div>
    </section>
  );
}
