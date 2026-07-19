import { NextRequest, NextResponse } from "next/server";
import { diagnosisInputSchema, diagnosisResultSchema } from "@/lib/diagnosis";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ saved: false, error: "Authentication required." }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ saved: false }, { status: 202 });
  try {
    const body = await request.json();
    const input = diagnosisInputSchema.parse(body.input);
    const result = diagnosisResultSchema.parse(body.result);
    const saved = await prisma.diagnosis.create({ data: { ...input, result, imageCount: Math.min(5, Math.max(0, Number(body.imageCount) || 0)), customerEmail: session.email } });
    return NextResponse.json({ saved: true, id: saved.id }, { status: 201 });
  } catch (error) {
    console.warn("Diagnosis persistence failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ saved: false }, { status: 202 });
  }
}
