"use server";

import { redirect } from "next/navigation";
import { endSession, getSession } from "@/lib/auth";

export async function logout() {
  const session = await getSession();
  await endSession();
  redirect(session?.role === "admin" ? "/admin/login" : session?.role === "technician" ? "/technician/login" : "/login");
}
