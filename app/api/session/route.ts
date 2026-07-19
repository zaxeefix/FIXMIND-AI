import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { roleHome } from "@/lib/permissions";
export async function GET(){const session=await getSession();return NextResponse.json(session?{authenticated:true,role:session.role,home:roleHome(session.role)}:{authenticated:false,role:"guest",home:"/"})}
