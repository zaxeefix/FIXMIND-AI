import { NextRequest, NextResponse } from "next/server";
import { diagnosisInputSchema } from "@/lib/diagnosis";
import { createDiagnosis, DiagnosisServiceError } from "@/lib/openai-diagnosis";
import { rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 800 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Sign in with a customer account to use AI Diagnosis." }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`diagnose:${ip}`).allowed) return NextResponse.json({ error: "Too many diagnosis attempts. Your information is safe—please try again later.", retryable: true }, { status: 429 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_TOTAL_BYTES) return NextResponse.json({ error: "The upload is too large. Remove an image and try again." }, { status: 413 });
  try {
    const form = await request.formData();
    const parsed = diagnosisInputSchema.safeParse(Object.fromEntries(["deviceCategory", "brand", "deviceModel", "deviceAge", "problemCategory", "description"].map((key) => [key, form.get(key)])));
    if (!parsed.success) return NextResponse.json({ error: "Please review the device information.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const files = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
    if (files.length > MAX_IMAGES) return NextResponse.json({ error: "Upload no more than five images." }, { status: 400 });
    for (const file of files) {
      if (!imageTypes.has(file.type) || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: `${file.name} must be JPG, PNG, or WebP and under 800 KB after compression.` }, { status: 400 });
    }
    const images = await Promise.all(files.map(async (file) => ({ mimeType: file.type, base64: Buffer.from(await file.arrayBuffer()).toString("base64") })));
    const outcome = await createDiagnosis(parsed.data, images);
    return NextResponse.json({ ...outcome, input: parsed.data, imageCount: files.length });
  } catch (error) {
    const message = error instanceof DiagnosisServiceError ? error.message : "AI service is temporarily busy. Your information has been saved. Please try again in a few minutes.";
    return NextResponse.json({ error: message, retryable: true }, { status: 503 });
  }
}
