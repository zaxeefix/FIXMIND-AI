import { z } from "zod";

// Optional environment variables are commonly present as KEY=. Treat those as
// unconfigured instead of crashing every server-rendered route.
const blankToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, schema);

const serverEnvSchema = z.object({
  OPENAI_API_KEY: blankToUndefined(z.string().min(20).optional()),
  OPENAI_DIAGNOSIS_MODEL: blankToUndefined(z.string().min(1).default("gpt-5.6-terra")),
  OPENAI_SIMULATE_FAILURE: blankToUndefined(z.enum(["429", "500", "timeout", "network"]).optional()),
  HACKATHON_DEMO: blankToUndefined(z.enum(["true", "false"]).default("false")).transform((value) => value === "true"),
  DATABASE_URL: blankToUndefined(z.string().url().optional()),
  AUTH_SECRET: blankToUndefined(z.string().min(32).optional()),
  DEMO_USER_EMAIL: blankToUndefined(z.string().email().default("demo@fixmind.ai")),
  DEMO_USER_PASSWORD: blankToUndefined(z.string().min(8).optional()),
  ADMIN_EMAIL: blankToUndefined(z.string().email().default("admin@fixmind.ai")),
  ADMIN_PASSWORD: blankToUndefined(z.string().min(8).optional()),
  TECHNICIAN_EMAIL: blankToUndefined(z.string().email().default("technician@fixmind.ai")),
  TECHNICIAN_PASSWORD: blankToUndefined(z.string().min(8).optional()),
});

export function parseServerEnv(source: Record<string, string | undefined>) {
  return serverEnvSchema.parse(source);
}

export function getServerEnv() {
  return parseServerEnv(process.env);
}

export function validateRuntimeEnv() {
  const env = getServerEnv();
  return {
    ...env,
    warnings: [
      !env.OPENAI_API_KEY && !env.HACKATHON_DEMO && "OPENAI_API_KEY is missing; diagnosis is unavailable.",
      !env.DATABASE_URL && "DATABASE_URL is missing; history persistence is unavailable.",
      !env.AUTH_SECRET && "AUTH_SECRET is missing; protected demo areas are unavailable.",
      !env.TECHNICIAN_PASSWORD && "TECHNICIAN_PASSWORD is missing; technician login is unavailable.",
    ].filter(Boolean) as string[],
  };
}
