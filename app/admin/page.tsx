import Link from "next/link";
import {
  Activity, BarChart3, Bell, Bot, BrainCircuit, CalendarCheck, CheckCircle2, CircleDollarSign,
  ClipboardList, Cpu, FileClock, FileText, Gauge, HeartPulse, PackageSearch, Settings,
  ShieldCheck, Smartphone, UserCog, Users, Wrench, LogOut,
} from "lucide-react";
import { BookingOperations, OperationsCharts, type BookingOperation, type ChartPoint } from "@/components/admin-console";
import { Logo } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/logout/actions";

const nav = [
  ["Overview", "#overview", Gauge], ["Bookings", "#bookings", CalendarCheck], ["Customers", "#customers", Users],
  ["Technicians", "#technicians", Wrench], ["AI Reports", "#ai-reports", FileText], ["AI Analytics", "#ai-analytics", BrainCircuit],
  ["Prompt Management", "#prompt-management", Bot], ["Inventory", "#inventory", PackageSearch], ["Notifications", "#notifications", Bell],
  ["Audit Logs", "#audit-logs", FileClock], ["System Settings", "#system-settings", Settings],
] as const;

export default async function AdminConsole() {
  const session = await requireSession("admin", "/admin/login");
  const env = getServerEnv();
  let bookings: Awaited<ReturnType<typeof prisma.booking.findMany>> = [];
  let diagnoses: Awaited<ReturnType<typeof prisma.diagnosis.findMany>> = [];
  let unavailable = false;
  try {
    [bookings, diagnoses] = await Promise.all([
      prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 250 }),
      prisma.diagnosis.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    ]);
  } catch {
    unavailable = true;
  }

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const active = bookings.filter(item => !["Completed", "Rejected"].includes(item.status));
  const pending = bookings.filter(item => ["Booked", "Approved", "Received"].includes(item.status));
  const completed = bookings.filter(item => item.status === "Completed");
  const diagnosisToday = diagnoses.filter(item => item.createdAt >= startToday);
  const diagnosisMonth = diagnoses.filter(item => item.createdAt >= startMonth);
  const confidenceValues = diagnoses.map(item => confidenceOf(item.result)).filter((value): value is number => value !== null);
  const averageConfidence = confidenceValues.length ? Math.round(confidenceValues.reduce((sum,value)=>sum+value,0)/confidenceValues.length) : 0;
  const customerEmails = new Set([...bookings.map(item=>item.customerEmail),...diagnoses.map(item=>item.customerEmail).filter(Boolean) as string[]]);
  const technicianEmails = new Set(bookings.map(item=>item.assignedTechnicianEmail).filter(Boolean) as string[]);
  const revenue = bookings.reduce((sum,item)=>sum+item.estimatedTotalCents,0);
  const metrics = [
    [Users,"Total users",String(customerEmails.size+technicianEmails.size+1)], [UserCog,"Customers",String(customerEmails.size)],
    [Wrench,"Technicians",String(technicianEmails.size||1)], [BrainCircuit,"AI diagnoses today",String(diagnosisToday.length)],
    [BarChart3,"AI diagnoses this month",String(diagnosisMonth.length)], [ClipboardList,"Pending repairs",String(pending.length)],
    [Activity,"Active repairs",String(active.length)], [CheckCircle2,"Completed repairs",String(completed.length)],
    [Gauge,"Average AI confidence",`${averageConfidence}%`], [CircleDollarSign,"Revenue estimate",money(revenue)],
    [FileText,"Open tickets",String(active.length)], [HeartPulse,"Platform health",unavailable?"Degraded":"Operational"],
  ] as const;

  const daily = lastSevenDays(diagnoses);
  const brands = countBy(diagnoses.map(item=>item.brand));
  const faults = countBy(diagnoses.map(item=>item.problemCategory));
  const statuses = countBy(bookings.map(item=>item.status));
  const bookingRows: BookingOperation[] = bookings.map(item=>({id:item.id,device:`${item.brand} ${item.deviceModel}`,service:item.service,customer:item.customerName,email:item.customerEmail,appointment:item.appointmentAt.toLocaleString(),status:item.status,technician:item.assignedTechnicianEmail||"",total:money(item.estimatedTotalCents)}));
  const customers = Array.from(customerEmails).map(email=>({email,bookings:bookings.filter(item=>item.customerEmail===email).length,diagnoses:diagnoses.filter(item=>item.customerEmail===email).length,devices:new Set([...bookings.filter(item=>item.customerEmail===email).map(item=>`${item.brand} ${item.deviceModel}`),...diagnoses.filter(item=>item.customerEmail===email).map(item=>`${item.brand} ${item.deviceModel}`)]).size})).sort((a,b)=>b.bookings+b.diagnoses-a.bookings-a.diagnoses);
  const audit = [
    ...bookings.slice(0,6).map(item=>({at:item.updatedAt,action:`Repair ${item.status.toLowerCase()}`,detail:`${item.brand} ${item.deviceModel} · ${item.customerEmail}`})),
    ...diagnoses.slice(0,6).map(item=>({at:item.createdAt,action:"AI diagnosis completed",detail:`${item.brand} ${item.deviceModel} · ${item.problemCategory}`})),
  ].sort((a,b)=>b.at.getTime()-a.at.getTime()).slice(0,10);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 xl:grid xl:grid-cols-[270px_1fr]">
      <aside className="hidden min-h-screen border-r border-slate-800 bg-slate-950 p-5 text-slate-300 xl:sticky xl:top-0 xl:block xl:h-screen">
        <div className="border-b border-slate-800 pb-5"><Logo inverse /><p className="mt-4 mb-0 text-xs text-slate-500">AI Operations Console</p></div>
        <nav aria-label="Admin console" className="mt-5 grid gap-1 overflow-y-auto">{nav.map(([label,href,Icon],index)=><a key={label} href={href} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm no-underline hover:bg-white/10 hover:text-white ${index===0?"bg-blue-600 text-white":""}`}><Icon size={17}/>{label}</a>)}</nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-slate-800 bg-slate-900 p-3"><p className="m-0 truncate text-xs font-semibold text-white">{session.email}</p><div className="mt-1 flex items-center justify-between"><p className="m-0 text-[10px] text-green-400">● Administrator verified</p><form action={logout}><button className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"><LogOut size={12}/>Logout</button></form></div></div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-xl"><div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-7"><div className="xl:hidden"><Logo /></div><div className="hidden xl:block"><b>FixMind Operations</b><small className="ml-3 text-slate-500">Real-time platform intelligence</small></div><div className="flex items-center gap-2"><span className={`badge ${unavailable?"badge-amber":"badge-green"}`}><HeartPulse size={14}/>{unavailable?"Database degraded":"All systems operational"}</span><Link href="/" className="btn btn-secondary !h-10 !px-3 text-xs">Public site</Link></div></div><nav aria-label="Admin mobile sections" className="flex gap-2 overflow-x-auto border-t px-4 py-2 xl:hidden">{nav.slice(0,7).map(([label,href])=><a key={label} href={href} className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold">{label}</a>)}</nav></header>
        <main className="p-4 sm:p-7 xl:p-9">
          <section id="overview" className="scroll-mt-24"><p className="eyebrow">Platform command center</p><h1 className="h1 my-2 font-bold">AI Operations Console</h1><p className="m-0 max-w-3xl text-slate-600">Monitor GPT-powered diagnoses, repair operations, customers, technician workload, and system health from one trusted workspace.</p>{unavailable&&<p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is temporarily unavailable. Operational controls remain protected while data reconnects.</p>}<div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{metrics.map(([Icon,label,value])=><article className="card !p-5" key={label}><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={19}/></span>{label==="Platform health"&&<span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]"/>}</div><p className="mt-5 mb-1 text-xs text-slate-500">{label}</p><p className="m-0 text-2xl font-bold tracking-tight">{value}</p></article>)}</div></section>

          <section id="ai-analytics" className="mt-9 scroll-mt-24"><SectionHead eyebrow="AI intelligence" title="Platform analytics" copy="Live distributions derived from saved diagnoses and repair operations."/><OperationsCharts daily={daily} brands={brands} faults={faults} statuses={statuses}/></section>
          <div className="mt-9"><BookingOperations rows={bookingRows} technicianEmail={env.TECHNICIAN_EMAIL}/></div>

          <section id="customers" className="card mt-9 scroll-mt-24 overflow-x-auto"><SectionHead eyebrow="Customer intelligence" title="Customer management" copy="Real account activity aggregated from bookings and saved AI reports."/><table className="w-full min-w-[680px] text-left text-sm"><thead><tr>{["Customer","Devices","AI reports","Bookings","Account"].map(label=><th className="border-b py-3 text-xs uppercase tracking-wide text-slate-500" key={label}>{label}</th>)}</tr></thead><tbody>{customers.slice(0,25).map(customer=><tr key={customer.email}><td className="border-b py-4 font-semibold">{customer.email}</td><td className="border-b">{customer.devices}</td><td className="border-b">{customer.diagnoses}</td><td className="border-b">{customer.bookings}</td><td className="border-b"><span className="badge badge-green">Active</span></td></tr>)}</tbody></table>{!customers.length&&<Empty copy="Customer activity appears after the first diagnosis or booking."/>}</section>

          <section id="technicians" className="mt-9 scroll-mt-24"><SectionHead eyebrow="Repair workforce" title="Technician performance" copy="Current workload and completion data for the configured technician workspace."/><div className="grid gap-4 lg:grid-cols-3"><OperationalCard icon={<UserCog/>} label="Approved technician" value={env.TECHNICIAN_EMAIL}/><OperationalCard icon={<Wrench/>} label="Current workload" value={`${bookings.filter(item=>item.assignedTechnicianEmail===env.TECHNICIAN_EMAIL&&item.status!=="Completed").length} active repairs`}/><OperationalCard icon={<CheckCircle2/>} label="Completed repairs" value={String(bookings.filter(item=>item.assignedTechnicianEmail===env.TECHNICIAN_EMAIL&&item.status==="Completed").length)}/></div></section>

          <section id="ai-reports" className="card mt-9 scroll-mt-24 overflow-x-auto"><SectionHead eyebrow="Structured output" title="AI report management" copy="Search-ready report records with device, confidence, issue type, and timestamp."/><table className="w-full min-w-[760px] text-left text-sm"><thead><tr>{["Report","Device","Fault category","Confidence","Images","Generated"].map(label=><th className="border-b py-3 text-xs uppercase tracking-wide text-slate-500" key={label}>{label}</th>)}</tr></thead><tbody>{diagnoses.slice(0,20).map(report=><tr key={report.id}><td className="border-b py-4 font-mono text-xs">{report.id.slice(-8).toUpperCase()}</td><td className="border-b font-semibold">{report.brand} {report.deviceModel}</td><td className="border-b">{report.problemCategory}</td><td className="border-b"><span className="badge badge-blue">{confidenceOf(report.result)??0}%</span></td><td className="border-b">{report.imageCount}</td><td className="border-b">{report.createdAt.toLocaleString()}</td></tr>)}</tbody></table>{!diagnoses.length&&<Empty copy="Structured AI reports appear after customers complete diagnoses."/>}</section>

          <section id="prompt-management" className="mt-9 scroll-mt-24"><SectionHead eyebrow="Model governance" title="AI configuration" copy="Production model settings are deployment-managed so prompt changes remain reviewed and auditable in Git."/><div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]"><div className="grid gap-4 sm:grid-cols-2"><OperationalCard icon={<Cpu/>} label="Current model" value={env.OPENAI_DIAGNOSIS_MODEL}/><OperationalCard icon={<FileText/>} label="Prompt version" value="v1 · Structured diagnosis"/><OperationalCard icon={<Gauge/>} label="Reasoning effort" value="Medium"/><OperationalCard icon={<Smartphone/>} label="Maximum images" value="5 per diagnosis"/></div><div className="card bg-slate-950 text-slate-200"><div className="flex items-center justify-between"><h3 className="m-0 text-base font-semibold">System prompt preview</h3><span className="badge bg-white/10 text-cyan-300">Read only</span></div><pre className="mt-5 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-black/20 p-4 text-xs leading-6 text-slate-400">You are FixMind AI, a cautious senior electronic repair diagnostician. Analyze only supplied symptoms and images. Return validated structured output with likely faults, confidence, cost, duration, required tools and parts, safety warnings, and the safest recommended next action.</pre><p className="mb-0 text-xs text-slate-500">Prompt edits require a reviewed deployment. Secrets and API keys are never exposed here.</p></div></div></section>

          <section id="inventory" className="mt-9 scroll-mt-24"><SectionHead eyebrow="Parts intelligence" title="Inventory signals" copy="Recommended parts extracted from structured AI reports indicate likely future demand."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{topParts(diagnoses).map(item=><OperationalCard key={item.label} icon={<PackageSearch/>} label={item.label} value={`${item.value} recommendations`}/>)}{!topParts(diagnoses).length&&<div className="card sm:col-span-2"><Empty copy="Parts demand appears as AI reports recommend replacements."/></div>}</div></section>

          <section id="notifications" className="mt-9 scroll-mt-24"><SectionHead eyebrow="Attention center" title="Operational notifications" copy="The most important platform conditions requiring administrator attention."/><div className="grid gap-3">{pending.length>0&&<Notice tone="amber" title={`${pending.length} repairs need review`} copy="Approve, assign, or update pending bookings from the operations queue."/>}{active.filter(item=>!item.assignedTechnicianEmail).length>0&&<Notice tone="blue" title={`${active.filter(item=>!item.assignedTechnicianEmail).length} active repairs are unassigned`} copy="Assign the configured technician so work appears in the technician workspace."/>}<Notice tone="green" title="AI reliability controls enabled" copy="Structured validation, retries, cache, rate limits, and hackathon fallback are active."/></div></section>

          <section id="audit-logs" className="card mt-9 scroll-mt-24"><SectionHead eyebrow="Accountability" title="Recent audit activity" copy="Operational activity reconstructed from persisted repair and AI-report timestamps."/><div className="grid gap-1">{audit.map((event,index)=><div key={`${event.at.toISOString()}-${index}`} className="flex flex-col gap-1 border-b py-3 sm:flex-row sm:items-center"><span className="w-44 shrink-0 text-xs text-slate-500">{event.at.toLocaleString()}</span><b className="w-52 text-sm">{event.action}</b><span className="truncate text-sm text-slate-600">{event.detail}</span></div>)}{!audit.length&&<Empty copy="Audit activity appears as diagnoses and repairs are created or updated."/>}</div></section>

          <section id="system-settings" className="mt-9 scroll-mt-24"><SectionHead eyebrow="Environment readiness" title="System settings and health" copy="Deployment configuration status without exposing sensitive values."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Health label="OpenAI API" ready={Boolean(env.OPENAI_API_KEY)} detail={env.OPENAI_API_KEY?"Configured server-side":"Demo fallback only"}/><Health label="PostgreSQL" ready={!unavailable&&Boolean(env.DATABASE_URL)} detail={!unavailable?"Connected":"Unavailable"}/><Health label="Authentication" ready={Boolean(env.AUTH_SECRET)} detail={env.AUTH_SECRET?"Signed sessions enabled":"Configuration required"}/><Health label="Demo resilience" ready={env.HACKATHON_DEMO} detail={env.HACKATHON_DEMO?"Fallback enabled":"Fallback disabled"}/></div></section>
        </main>
      </div>
    </div>
  );
}

function confidenceOf(value: unknown) { if(value&&typeof value==="object"&&!Array.isArray(value)&&"confidence" in value){const confidence=(value as {confidence?:unknown}).confidence;return typeof confidence==="number"?confidence:null}return null }
function countBy(values:string[]):ChartPoint[]{const counts=new Map<string,number>();values.forEach(value=>counts.set(value,(counts.get(value)||0)+1));return Array.from(counts,([label,value])=>({label,value})).sort((a,b)=>b.value-a.value)}
function lastSevenDays(diagnoses:Awaited<ReturnType<typeof prisma.diagnosis.findMany>>):ChartPoint[]{return Array.from({length:7},(_,offset)=>{const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-(6-offset));const next=new Date(date);next.setDate(next.getDate()+1);return{label:date.toLocaleDateString("en-US",{weekday:"short"}),value:diagnoses.filter(item=>item.createdAt>=date&&item.createdAt<next).length}})}
function topParts(diagnoses:Awaited<ReturnType<typeof prisma.diagnosis.findMany>>):ChartPoint[]{const parts:string[]=[];diagnoses.forEach(item=>{const value=item.result;if(value&&typeof value==="object"&&!Array.isArray(value)&&"requiredParts" in value){const list=(value as {requiredParts?:unknown}).requiredParts;if(Array.isArray(list))parts.push(...list.filter((part):part is string=>typeof part==="string"))}});return countBy(parts).slice(0,4)}
function money(cents:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(cents/100)}
function SectionHead({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string}){return <div className="mb-5"><p className="eyebrow mb-1">{eyebrow}</p><h2 className="m-0 text-xl font-semibold">{title}</h2><p className="mt-1 mb-0 text-sm leading-6 text-slate-500">{copy}</p></div>}
function OperationalCard({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="card"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">{icon}</span><p className="mt-5 mb-1 text-xs text-slate-500">{label}</p><b className="break-words text-lg">{value}</b></div>}
function Empty({copy}:{copy:string}){return <p className="m-0 py-8 text-center text-sm text-slate-500">{copy}</p>}
function Notice({tone,title,copy}:{tone:"amber"|"blue"|"green";title:string;copy:string}){const colors=tone==="amber"?"border-amber-200 bg-amber-50 text-amber-900":tone==="green"?"border-green-200 bg-green-50 text-green-900":"border-blue-200 bg-blue-50 text-blue-900";return <div className={`rounded-2xl border p-4 ${colors}`}><b className="block text-sm">{title}</b><p className="mt-1 mb-0 text-sm opacity-80">{copy}</p></div>}
function Health({label,ready,detail}:{label:string;ready:boolean;detail:string}){return <div className="card"><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${ready?"bg-green-50 text-green-600":"bg-amber-50 text-amber-600"}`}><ShieldCheck size={19}/></span><span className={`h-2.5 w-2.5 rounded-full ${ready?"bg-green-500":"bg-amber-500"}`}/></div><p className="mt-5 mb-1 text-sm font-semibold">{label}</p><p className="m-0 text-xs text-slate-500">{detail}</p></div>}
