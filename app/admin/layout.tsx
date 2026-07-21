import type { ReactNode } from "react";
import { SessionTimeout } from "@/components/session-timeout";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return <>{session?.role === "admin" && <SessionTimeout role="admin" />}{children}</>;
}
