import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth";

export default async function BookingLayout({ children }: { children: ReactNode }) {
  await requireSession("customer");
  return children;
}
