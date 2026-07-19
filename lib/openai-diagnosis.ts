import "server-only";
import OpenAI from "openai";
import { diagnosisJsonSchema, diagnosisResultSchema, type DiagnosisInput } from "@/lib/diagnosis";
import { cacheDiagnosis, createDemoDiagnosis, diagnosisCacheKey, getCachedDiagnosis, isTemporaryFailure, retryDelay, type DiagnosisOutcome, type FailureKind } from "@/lib/diagnosis-reliability";
import { getServerEnv } from "@/lib/env";

export type DiagnosisImage = { mimeType: string; base64: string };
const FRIENDLY_FAILURE = "AI service is temporarily busy. Your information has been saved. Please try again in a few minutes.";
const loggedFailures = new WeakSet<object>();

export async function createDiagnosis(input: DiagnosisInput, images: DiagnosisImage[]): Promise<DiagnosisOutcome> {
  const env = getServerEnv();
  const key = diagnosisCacheKey(input, images);
  const cached = getCachedDiagnosis(key);
  if (cached) return { data: cached, mode: "cache", notice: "Returned from the secure 24-hour diagnosis cache." };

  try {
    if (!env.OPENAI_API_KEY) throw new DiagnosisServiceError("unauthorized", FRIENDLY_FAILURE);
    const data = await requestWithRetry(input, images, env);
    cacheDiagnosis(key, data);
    return { data, mode: "ai" };
  } catch (error) {
    const failure = normalizeFailure(error);
    if ((typeof error !== "object" || error === null) || !loggedFailures.has(error)) logFailure(error, failure);
    if (env.HACKATHON_DEMO) {
      return { data: createDemoDiagnosis(input), mode: "demo", notice: "Demo Diagnosis (AI temporarily unavailable)" };
    }
    throw new DiagnosisServiceError(failure.kind, FRIENDLY_FAILURE, failure.status, failure.requestId);
  }
}

async function requestWithRetry(input: DiagnosisInput, images: DiagnosisImage[], env: ReturnType<typeof getServerEnv>) {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY!, maxRetries: 0, timeout: 35_000 });
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      simulateDevelopmentFailure(env.OPENAI_SIMULATE_FAILURE);
      const response = await openai.responses.create({
        model: env.OPENAI_DIAGNOSIS_MODEL,
        reasoning: { effort: "medium" },
        input: [
          { role: "system", content: [{ type: "input_text", text: "You are FixMind AI, a cautious senior electronics repair diagnostician. Give a preliminary diagnosis, never a guarantee. Use only supplied evidence. Keep advice actionable and concise. Never instruct an untrained user to handle live voltage, swollen batteries, water-damaged powered devices, or microsoldering. Escalate material uncertainty and safety risk to a professional. Give realistic USD estimates and return only the requested JSON." }] },
          { role: "user", content: [{ type: "input_text", text: `Device: ${input.deviceCategory}; brand/model: ${input.brand} ${input.deviceModel}; age: ${input.deviceAge}; category: ${input.problemCategory}. User report: ${input.description}` }, ...images.map((image) => ({ type: "input_image" as const, image_url: `data:${image.mimeType};base64,${image.base64}`, detail: "high" as const }))] },
        ],
        text: { format: { type: "json_schema", name: "device_diagnosis", strict: true, schema: diagnosisJsonSchema } },
      });
      return diagnosisResultSchema.parse(JSON.parse(response.output_text));
    } catch (error) {
      const failure = normalizeFailure(error);
      logFailure(error, failure);
      if (!isTemporaryFailure(failure.kind) || attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
    }
  }
  throw new DiagnosisServiceError("unknown", FRIENDLY_FAILURE);
}

function normalizeFailure(error: unknown): { kind: FailureKind; status?: number; requestId?: string } {
  if (error instanceof DiagnosisServiceError) return { kind: error.code, status: error.status, requestId: error.requestId };
  if (error instanceof OpenAI.APIConnectionTimeoutError) return { kind: "timeout" };
  if (error instanceof OpenAI.APIConnectionError) return { kind: "network" };
  if (error instanceof OpenAI.APIError) {
    const status = error.status;
    const kind: FailureKind = status === 429 ? "rate_limited" : [500, 502, 503, 504].includes(status ?? 0) ? "upstream" : status === 401 ? "unauthorized" : status === 403 ? "forbidden" : status === 400 || status === 422 ? "invalid_request" : "unknown";
    return { kind, status, requestId: error.requestID ?? undefined };
  }
  return { kind: "unknown" };
}

function logFailure(error: unknown, failure: ReturnType<typeof normalizeFailure>) {
  if (typeof error === "object" && error !== null) loggedFailures.add(error);
  console.error("FixMind OpenAI failure", { timestamp: new Date().toISOString(), errorType: failure.kind, statusCode: failure.status ?? null, requestId: failure.requestId ?? null, internalMessage: error instanceof Error ? error.message : "Unknown failure" });
}

function simulateDevelopmentFailure(value?: string) {
  if (process.env.NODE_ENV !== "development" || !value) return;
  const simulation = value.toLowerCase();
  if (simulation === "timeout") throw new DiagnosisServiceError("timeout", "Simulated timeout", 504);
  if (simulation === "network") throw new DiagnosisServiceError("network", "Simulated network failure");
  if (simulation === "429") throw new DiagnosisServiceError("rate_limited", "Simulated rate limit", 429);
  if (simulation === "500") throw new DiagnosisServiceError("upstream", "Simulated server failure", 500);
}

export class DiagnosisServiceError extends Error {
  constructor(public code: FailureKind, message: string, public status?: number, public requestId?: string) { super(message); }
}
