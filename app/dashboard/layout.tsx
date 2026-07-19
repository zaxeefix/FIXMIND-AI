import type {ReactNode} from "react";import {requireSession} from "@/lib/auth";
export default async function DashboardLayout({children}:{children:ReactNode}){await requireSession("customer");return children}
