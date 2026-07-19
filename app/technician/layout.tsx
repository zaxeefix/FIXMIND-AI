import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth";
export default async function TechnicianLayout({children}:{children:ReactNode}){await requireSession("technician");return children}
