"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Bell, Bot, BrainCircuit, CalendarCheck, ChevronLeft, ChevronRight, Download, FileClock, FileText, Gauge, LogOut, Menu, PackageSearch, Search, Settings, UserCog, Users, Wrench, X } from "lucide-react";
import { updateBookingOperation } from "@/app/admin/actions";
import { logout } from "@/app/logout/actions";
import { Logo } from "@/components/ui";

export type ChartPoint = { label: string; value: number };
export type HeatPoint = { day: string; period: string; value: number };
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

const navGroups = [
  { label: "Overview", links: [["Dashboard","#overview",Gauge],["Analytics","#analytics",BarChart3],["AI Operations","#ai-analytics",BrainCircuit]] },
  { label: "Repair operations", links: [["Bookings","#bookings",CalendarCheck],["Customers","#customers",Users],["Technicians","#technicians",Wrench],["Repair Reports","#ai-reports",FileText],["Inventory","#inventory",PackageSearch]] },
  { label: "AI management", links: [["Prompt Management","#prompt-management",Bot],["AI Reports","#ai-reports",FileText],["AI Logs","#audit-logs",Activity],["Model Settings","#model-settings",Settings]] },
  { label: "System", links: [["Audit Logs","#audit-logs",FileClock],["Notifications","#notifications",Bell],["System Settings","#system-settings",Settings],["Profile","#profile",UserCog]] },
] as const;

export function AdminSidebar({ email }: { email: string }) {
  const [collapsed,setCollapsed]=useState(false);const[mobile,setMobile]=useState(false);const[active,setActive]=useState("#overview");
  useEffect(()=>{const ids=navGroups.flatMap(group=>group.links.map(([,href])=>href.slice(1)));const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActive(`#${visible.target.id}`)},{rootMargin:"-15% 0px -70%",threshold:[0,.2,.6]});ids.forEach(id=>{const element=document.getElementById(id);if(element)observer.observe(element)});return()=>observer.disconnect()},[]);
  const contents=<><div className="flex items-center justify-between border-b border-slate-800 pb-5"><span className={collapsed?"hidden":"block"}><Logo inverse /></span>{collapsed&&<span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 font-bold text-white">F</span>}<button onClick={()=>setCollapsed(value=>!value)} aria-label={collapsed?"Expand sidebar":"Collapse sidebar"} className="hidden h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white xl:grid">{collapsed?<ChevronRight size={17}/>:<ChevronLeft size={17}/>}</button><button onClick={()=>setMobile(false)} aria-label="Close admin navigation" className="grid h-10 w-10 place-items-center xl:hidden"><X/></button></div><nav aria-label="Admin console" className="mt-4 grid gap-4 overflow-y-auto pb-24">{navGroups.map(group=><div key={group.label}><p className={`mb-1 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-600 ${collapsed?"sr-only":""}`}>{group.label}</p><div className="grid gap-1">{group.links.map(([label,href,Icon])=><a onClick={()=>setMobile(false)} key={`${group.label}-${label}`} href={href} aria-current={active===href?"page":undefined} title={collapsed?label:undefined} className={`relative flex min-h-10 items-center rounded-xl text-sm no-underline transition ${collapsed?"justify-center px-2":"gap-3 px-3"} ${active===href?"bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,.25)]":"text-slate-400 hover:bg-white/10 hover:text-white"}`}><Icon size={17}/>{!collapsed&&<span>{label}</span>}</a>)}</div></div>)}</nav><div className="absolute bottom-5 left-3 right-3 rounded-xl border border-slate-800 bg-slate-900 p-3"><p className={`m-0 truncate text-xs font-semibold text-white ${collapsed?"sr-only":""}`}>{email}</p><div className={`flex items-center ${collapsed?"justify-center":"mt-1 justify-between"}`}><p className={`m-0 text-[10px] text-green-400 ${collapsed?"sr-only":""}`}>● Administrator verified</p><form action={logout}><button aria-label="Log out" title="Log out" className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"><LogOut size={14}/>{!collapsed&&"Logout"}</button></form></div></div></>;
  return <><button onClick={()=>setMobile(true)} aria-label="Open admin navigation" className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-white shadow-xl xl:hidden"><Menu/></button><aside className={`relative hidden min-h-screen border-r border-slate-800 bg-slate-950 p-3 text-slate-300 transition-[width] duration-300 xl:sticky xl:top-0 xl:block xl:h-screen ${collapsed?"w-[76px]":"w-[270px]"}`}>{contents}</aside>{mobile&&<div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm xl:hidden" onClick={()=>setMobile(false)}><aside className="relative h-full w-[min(86vw,300px)] bg-slate-950 p-4 text-slate-300" onClick={event=>event.stopPropagation()}>{contents}</aside></div>}</>;
}

export function OperationsCharts({ daily, brands, faults, statuses, activity }: { daily: ChartPoint[]; brands: ChartPoint[]; faults: ChartPoint[]; statuses: ChartPoint[]; activity: HeatPoint[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <LineChart title="Daily AI diagnoses" points={daily} />
      <BarChart title="Top device brands" points={brands} />
      <BarChart title="Most common device faults" points={faults} />
      <BarChart title="Repair status distribution" points={statuses} />
      <DonutChart title="Repair status mix" points={statuses} />
      <DonutChart title="Device brand mix" points={brands} />
      <ActivityHeatmap points={activity} />
    </div>
  );
}

function DonutChart({title,points}:{title:string;points:ChartPoint[]}){const colors=["#2563eb","#06b6d4","#22c55e","#f59e0b","#8b5cf6","#ef4444"];const total=Math.max(1,points.reduce((sum,point)=>sum+point.value,0));let cursor=0;const stops=points.slice(0,6).map((point,index)=>{const start=cursor;cursor+=(point.value/total)*100;return`${colors[index]} ${start}% ${cursor}%`}).join(",");return <section className="card"><h3 className="mt-0 mb-6 text-base font-semibold">{title}</h3><div className="flex flex-col items-center gap-6 sm:flex-row"><div role="img" aria-label={`${title}: ${points.map(point=>`${point.label} ${point.value}`).join(", ")}`} className="relative h-36 w-36 shrink-0 rounded-full" style={{background:points.length?`conic-gradient(${stops})`:"#e2e8f0"}}><div className="absolute inset-7 grid place-items-center rounded-full bg-white text-center"><b className="text-2xl">{total}</b><small className="-mt-5 text-[9px] text-slate-500">TOTAL</small></div></div><div className="grid flex-1 gap-2">{points.slice(0,6).map((point,index)=><div className="flex items-center gap-2 text-xs" key={point.label}><span className="h-2.5 w-2.5 rounded-full" style={{background:colors[index]}}/><span className="flex-1 truncate text-slate-600">{point.label}</span><b>{Math.round(point.value/total*100)}%</b></div>)}</div></div></section>}
function ActivityHeatmap({points}:{points:HeatPoint[]}){const max=Math.max(1,...points.map(point=>point.value));const days=Array.from(new Set(points.map(point=>point.day)));const periods=Array.from(new Set(points.map(point=>point.period)));return <section className="card xl:col-span-2"><div className="mb-6 flex items-center justify-between"><h3 className="m-0 text-base font-semibold">Diagnosis activity heat map</h3><span className="text-xs text-slate-500">Last 7 days · UTC</span></div><div className="overflow-x-auto"><div className="grid min-w-[620px] gap-2" style={{gridTemplateColumns:`90px repeat(${periods.length},minmax(60px,1fr))`}}><span/>{periods.map(period=><span className="text-center text-[10px] text-slate-500" key={period}>{period}</span>)}{days.flatMap(day=>[<span className="self-center text-xs text-slate-500" key={`${day}-label`}>{day}</span>,...periods.map(period=>{const point=points.find(item=>item.day===day&&item.period===period);const opacity=.08+((point?.value||0)/max)*.82;return <span key={`${day}-${period}`} title={`${day} ${period}: ${point?.value||0} diagnoses`} className="h-9 rounded-lg border border-blue-100" style={{backgroundColor:`rgba(37,99,235,${opacity})`}}/>})])}</div></div></section>}

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
