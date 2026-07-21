import type {ReactNode} from "react";import {SessionTimeout} from "@/components/session-timeout";import {requireSession} from "@/lib/auth";
export default async function DashboardLayout({children}:{children:ReactNode}){await requireSession("customer");return <><SessionTimeout role="customer"/>{children}</>}
