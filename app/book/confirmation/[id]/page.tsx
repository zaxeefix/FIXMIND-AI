import Link from "next/link";
import { Check, CheckCircle2, ClipboardCheck, MapPin, ShieldCheck } from "lucide-react";
import { Logo, Stepper } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function BookingConfirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let booking: Awaited<ReturnType<typeof prisma.booking.findUnique>> = null;
  try {
    booking = await prisma.booking.findUnique({ where: { id } });
  } catch {
    // Keep the confirmation usable if persistence is temporarily unreachable.
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex h-[72px] items-center justify-between">
          <Logo />
          <span className="badge badge-green"><Check size={14} /> Booking received</span>
        </div>
      </header>
      <div className="border-b bg-white py-7"><div className="container"><Stepper current={4} /></div></div>
      <section className="container py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="success-pop mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-green-500 text-white shadow-[0_18px_50px_rgba(34,197,94,.25)]">
            <CheckCircle2 size={38} aria-hidden />
          </span>
          <p className="eyebrow mt-7">Repair request confirmed</p>
          <h1 className="h1 my-3 font-bold">Your repair journey is underway</h1>
          <p className="mx-auto max-w-xl text-lg leading-8 text-slate-600">
            A technician will review the device information and diagnosis before confirming parts, final pricing, and timing.
          </p>
        </div>
        <div className="mx-auto mt-9 grid max-w-3xl gap-4 sm:grid-cols-3">
          <Summary icon={<ClipboardCheck />} title="Reference" value={id.slice(-8).toUpperCase()} />
          <Summary icon={<MapPin />} title="Repair location" value={booking?.location || "Provided location"} />
          <Summary icon={<ShieldCheck />} title="Current stage" value={booking?.status || "Booked"} />
        </div>
        {booking && (
          <div className="card mx-auto mt-5 max-w-3xl bg-white">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="eyebrow mb-1">Repair summary</p>
                <h2 className="m-0 text-xl font-semibold">{booking.brand} {booking.deviceModel}</h2>
                <p className="mt-1 mb-0 text-sm text-slate-500">{booking.service} · {booking.appointmentAt.toLocaleString()}</p>
              </div>
              <span className="badge badge-blue self-start sm:self-auto">{booking.status}</span>
            </div>
          </div>
        )}
        <div className="mx-auto mt-7 flex max-w-3xl flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login" className="btn btn-primary">Sign in to track repair</Link>
          <Link href="/dashboard" className="btn btn-secondary">Open dashboard</Link>
          <Link href="/" className="btn btn-secondary">Return home</Link>
        </div>
        <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-5 text-slate-500">
          Keep your reference number. FixMind diagnosis is preliminary guidance; a qualified technician confirms the final repair.
        </p>
      </section>
    </main>
  );
}

function Summary({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="card text-left">
      <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">{icon}</span>
      <small className="text-slate-500">{title}</small>
      <b className="mt-1 block break-words">{value}</b>
    </div>
  );
}
