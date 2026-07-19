import type {ReactNode} from "react";import {requireSession} from "@/lib/auth";
export default async function AdminLayout({children}:{children:ReactNode}){await requireSession("admin");return children}
