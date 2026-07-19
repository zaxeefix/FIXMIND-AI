import { createHash } from "node:crypto";
import type { DiagnosisInput, DiagnosisResult } from "./diagnosis.ts";

export type DiagnosisMode = "ai" | "cache" | "demo";
export type DiagnosisOutcome = { data: DiagnosisResult; mode: DiagnosisMode; notice?: string };
export type FailureKind = "rate_limited" | "timeout" | "network" | "upstream" | "unauthorized" | "forbidden" | "invalid_request" | "unknown";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { data: DiagnosisResult; expiresAt: number }>();

export function diagnosisCacheKey(input: DiagnosisInput, images: Array<{ base64: string }>) {
  const imageHashes = images.map((image) => createHash("sha256").update(image.base64).digest("hex"));
  return createHash("sha256").update(JSON.stringify({ ...input, description: input.description.trim().toLowerCase(), imageHashes })).digest("hex");
}

export function getCachedDiagnosis(key: string, now = Date.now()) {
  const hit = cache.get(key);
  if (!hit || hit.expiresAt <= now) { cache.delete(key); return null; }
  return hit.data;
}

export function cacheDiagnosis(key: string, data: DiagnosisResult, now = Date.now()) {
  cache.set(key, { data, expiresAt: now + CACHE_TTL_MS });
}

export function isTemporaryFailure(kind: FailureKind) {
  return ["rate_limited", "timeout", "network", "upstream"].includes(kind);
}

export function retryDelay(attempt: number) {
  return 500 * 2 ** Math.max(0, attempt - 1);
}

const issueProfiles: Record<string, { issue: string; causes: string[]; parts: string[]; cost: [number, number]; time: string; difficulty: DiagnosisResult["difficulty"]; warning: string }> = {
  Charging: { issue: "Charging system fault", causes: ["Debris or wear in the charging port", "Degraded battery", "Charging controller fault"], parts: ["Charging port assembly", "Battery, if testing confirms degradation"], cost: [35, 120], time: "30–90 minutes", difficulty: "Medium", warning: "Stop charging immediately if the device becomes hot, smells unusual, or the battery appears swollen." },
  Battery: { issue: "Battery degradation or power-delivery fault", causes: ["Aged battery cells", "High background power consumption", "Power-management circuit issue"], parts: ["Compatible replacement battery"], cost: [45, 140], time: "45–120 minutes", difficulty: "Medium", warning: "Do not puncture, bend, heat, or continue using a swollen battery." },
  Display: { issue: "Display assembly or connector fault", causes: ["Panel damage", "Loose display connector", "Backlight or display-controller fault"], parts: ["Compatible display assembly"], cost: [80, 320], time: "60–180 minutes", difficulty: "Hard", warning: "Broken glass can cause injury; avoid pressing the display and use a qualified technician." },
  Power: { issue: "Power delivery or mainboard fault", causes: ["Depleted or failed battery", "Damaged charging path", "Power-management component fault"], parts: ["Battery or charging assembly after testing"], cost: [45, 220], time: "60–240 minutes", difficulty: "Hard", warning: "Do not repeatedly power a wet, unusually hot, or swollen device." },
  "Water Damage": { issue: "Liquid ingress affecting internal electronics", causes: ["Moisture at connectors", "Corrosion on the mainboard", "Shorted peripheral component"], parts: ["Affected connectors or modules after inspection"], cost: [60, 280], time: "2–24 hours", difficulty: "Expert", warning: "Power the device off. Do not charge it, use heat, or place it in rice; arrange professional inspection." },
  Software: { issue: "Operating-system or application fault", causes: ["Corrupted update or cache", "Insufficient storage", "Conflicting application or settings"], parts: [], cost: [0, 80], time: "20–90 minutes", difficulty: "Easy", warning: "Back up important data before resets, updates, or recovery procedures." },
};

export function createDemoDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const profile = issueProfiles[input.problemCategory] ?? { issue: `${input.problemCategory} subsystem fault`, causes: ["Worn or damaged component", "Loose internal connection", "Software or firmware conflict"], parts: ["Replacement component after technician testing"], cost: [40, 180] as [number, number], time: "45–180 minutes", difficulty: "Medium" as const, warning: "Power the device off if it becomes hot, emits an odor, or shows signs of battery damage." };
  return {
    diagnosis: [`Possible ${profile.issue.toLowerCase()}`],
    confidence: 68,
    causes: profile.causes,
    difficulty: profile.difficulty,
    estimatedCost: { minimum: profile.cost[0], maximum: profile.cost[1], currency: "USD" },
    estimatedTime: profile.time,
    requiredTools: ["Professional diagnostic tools"],
    requiredParts: profile.parts,
    repairSteps: ["Preserve your data and power the device off if safe to do so.", `Have a technician test the ${input.problemCategory.toLowerCase()} system and related connections.`, "Confirm the failed component before approving replacement parts."],
    safetyWarnings: [profile.warning],
    recommendedAction: "Book a qualified technician to verify the suspected fault before parts are purchased or the device is opened.",
    customerSummary: `Based on the reported symptoms for this ${input.brand} ${input.deviceModel}, the ${profile.issue.toLowerCase()} should be inspected first. This temporary demo assessment must be confirmed by a qualified technician.`,
    similarCases: { successRate: 88, averageCost: Math.round((profile.cost[0] + profile.cost[1]) / 2), averageRepairTime: profile.time, mostCommonFix: profile.parts[0] || "Software recovery" },
  };
}
