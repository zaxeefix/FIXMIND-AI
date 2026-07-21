import { NextResponse } from "next/server";
import { createSession, endSession, getRegisteredCustomerProfile, getSession, SESSION_IDLE_SECONDS } from "@/lib/auth";
import { roleHome } from "@/lib/permissions";
export async function GET(){const session=await getSession();const profile=session?.role==="customer"?await getRegisteredCustomerProfile(session.email):null;return NextResponse.json(session?{authenticated:true,email:session.email,name:profile?.name||"",role:session.role,home:roleHome(session.role),idleTimeoutSeconds:SESSION_IDLE_SECONDS}:{authenticated:false,role:"guest",home:"/"},{headers:{"Cache-Control":"no-store"}})}
export async function PATCH(){const session=await getSession();if(!session)return NextResponse.json({error:"Session expired."},{status:401});await createSession(session.email,session.role);return NextResponse.json({ok:true,expiresIn:SESSION_IDLE_SECONDS},{headers:{"Cache-Control":"no-store"}})}
export async function DELETE(){await endSession();return NextResponse.json({ok:true},{headers:{"Clear-Site-Data":"\"cache\", \"storage\"","Cache-Control":"no-store"}})}
