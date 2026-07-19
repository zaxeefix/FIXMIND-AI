"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const statuses = new Set(["Booked", "Approved", "Received", "Diagnosing", "In repair", "Ready", "Completed", "Rejected"]);

export async function updateBookingOperation(form: FormData) {
  await requireSession("admin", "/admin/login");
  const id = String(form.get("id") || "");
  const status = String(form.get("status") || "");
  const requestedTechnician = String(form.get("assignedTechnicianEmail") || "").trim().toLowerCase();
  const configuredTechnician = getServerEnv().TECHNICIAN_EMAIL.toLowerCase();
  if (!id || !statuses.has(status)) return;
  const assignedTechnicianEmail = requestedTechnician === configuredTechnician ? requestedTechnician : null;
  await prisma.booking.update({ where: { id }, data: { status, assignedTechnicianEmail } });
  revalidatePath("/admin");
  revalidatePath("/technician");
}
