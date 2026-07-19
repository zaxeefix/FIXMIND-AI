"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statuses = new Set(["Received", "Diagnosing", "In repair", "Ready", "Completed"]);
export async function updateRepair(form: FormData) {
  const session = await requireSession("technician");
  const id = String(form.get("id") || "");
  const status = String(form.get("status") || "");
  const technicianNotes = String(form.get("technicianNotes") || "").trim().slice(0, 2000);
  if (!id || !statuses.has(status)) return;
  await prisma.booking.updateMany({ where: { id, assignedTechnicianEmail: session.email }, data: { status, technicianNotes } });
  revalidatePath("/technician");
}
