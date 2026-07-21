import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { roleHome } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { PremiumGate } from "@/components/premium-gate";
import { SessionTimeout } from "@/components/session-timeout";

export const metadata: Metadata = { title: "AI Device Diagnosis", description: "Premium AI-assisted device diagnosis for FixMind customers." };
export default async function DiagnosisLayout({children}:{children:React.ReactNode}){const session=await getSession();if(!session)return <PremiumGate/>;if(session.role!=="customer")redirect(roleHome(session.role));return <><SessionTimeout role="customer"/>{children}</>}
