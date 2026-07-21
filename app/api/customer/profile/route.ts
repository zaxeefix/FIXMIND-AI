import { NextResponse } from "next/server";
import { getRegisteredCustomerProfile, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const registered = await getRegisteredCustomerProfile(session.email);
  let recent: { customerName: string; phone: string; notes: string | null } | null = null;
  try {
    recent = await prisma.booking.findFirst({ where: { customerEmail: session.email }, orderBy: { createdAt: "desc" }, select: { customerName: true, phone: true, notes: true } });
  } catch { /* Session identity still provides a useful partial prefill. */ }
  const address = recent?.notes?.match(/\[Customer address: ([^\]]+)]/)?.[1] || "";
  return NextResponse.json({ email: session.email, name: recent?.customerName || registered?.name || "", phone: recent?.phone || "", address }, { headers: { "Cache-Control": "no-store" } });
}
