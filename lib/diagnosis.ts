import { z } from "zod";

export const diagnosisInputSchema = z.object({
  deviceCategory: z.enum(["Smartphone", "Tablet", "Laptop", "Smartwatch"]),
  brand: z.enum(["Apple", "Samsung", "Google", "Huawei", "Tecno", "Infinix", "Xiaomi", "Oppo", "Vivo", "Nokia", "Lenovo", "HP", "Dell", "Asus", "Acer", "MSI"]),
  deviceModel: z.string().trim().min(2).max(80),
  deviceAge: z.enum(["Less than 1 year", "1–2 years", "2–4 years", "More than 4 years"]),
  problemCategory: z.enum(["Power", "Display", "Battery", "Charging", "Camera", "Audio", "Network", "Software", "Water Damage", "Physical Damage", "Other"]),
  description: z.string().trim().min(20).max(2000),
});

export const diagnosisResultSchema = z.object({
  diagnosis: z.array(z.string()).min(1).max(3),
  confidence: z.number().int().min(0).max(100),
  causes: z.array(z.string()).min(1).max(6),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Expert"]),
  estimatedCost: z.object({ minimum: z.number().nonnegative(), maximum: z.number().nonnegative(), currency: z.string().length(3) }),
  estimatedTime: z.string().min(2).max(100),
  requiredTools: z.array(z.string()).max(10),
  requiredParts: z.array(z.string()).max(10),
  repairSteps: z.array(z.string()).min(1).max(12),
  safetyWarnings: z.array(z.string()).min(1).max(8),
  recommendedAction: z.string().min(10).max(500),
  customerSummary: z.string().min(20).max(1000),
  similarCases: z.object({ successRate: z.number().int().min(0).max(100), averageCost: z.number().nonnegative(), averageRepairTime: z.string().min(2).max(100), mostCommonFix: z.string().min(2).max(200) }),
});

export type DiagnosisResult = z.infer<typeof diagnosisResultSchema>;
export type DiagnosisInput = z.infer<typeof diagnosisInputSchema>;

export const diagnosisJsonSchema = {
  type: "object", additionalProperties: false,
  required: ["diagnosis","confidence","causes","difficulty","estimatedCost","estimatedTime","requiredTools","requiredParts","repairSteps","safetyWarnings","recommendedAction","customerSummary","similarCases"],
  properties: {
    diagnosis: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    causes: { type: "array", minItems: 1, maxItems: 6, items: { type: "string" } },
    difficulty: { type: "string", enum: ["Easy","Medium","Hard","Expert"] },
    estimatedCost: { type: "object", additionalProperties: false, required: ["minimum","maximum","currency"], properties: { minimum: { type: "number", minimum: 0 }, maximum: { type: "number", minimum: 0 }, currency: { type: "string", minLength: 3, maxLength: 3 } } },
    estimatedTime: { type: "string" },
    requiredTools: { type: "array", maxItems: 10, items: { type: "string" } },
    requiredParts: { type: "array", maxItems: 10, items: { type: "string" } },
    repairSteps: { type: "array", minItems: 1, maxItems: 12, items: { type: "string" } },
    safetyWarnings: { type: "array", minItems: 1, maxItems: 8, items: { type: "string" } },
    recommendedAction: { type: "string" },
    customerSummary: { type: "string" },
    similarCases: { type: "object", additionalProperties: false, required: ["successRate","averageCost","averageRepairTime","mostCommonFix"], properties: { successRate: { type: "integer", minimum: 0, maximum: 100 }, averageCost: { type: "number", minimum: 0 }, averageRepairTime: { type: "string" }, mostCommonFix: { type: "string" } } },
  },
} as const;
