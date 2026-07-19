import test from "node:test";
import assert from "node:assert/strict";
import { cacheDiagnosis, createDemoDiagnosis, diagnosisCacheKey, getCachedDiagnosis, isTemporaryFailure, retryDelay } from "../lib/diagnosis-reliability.ts";

const input = { deviceCategory: "Smartphone", brand: "Apple", deviceModel: "iPhone 15", deviceAge: "1–2 years", problemCategory: "Charging", description: "The phone stopped charging reliably after the cable became loose." } as const;

test("demo diagnosis is deterministic and contains required repair fields", () => {
  const result = createDemoDiagnosis(input);
  assert.match(result.diagnosis[0], /charging/i);
  assert.ok(result.confidence > 0);
  assert.ok(result.estimatedCost.maximum >= result.estimatedCost.minimum);
  assert.ok(result.requiredParts.length > 0);
  assert.ok(result.safetyWarnings.length > 0);
});

test("successful diagnoses are cached for 24 hours", () => {
  const key = diagnosisCacheKey(input, []);
  const result = createDemoDiagnosis(input);
  cacheDiagnosis(key, result, 1_000);
  assert.deepEqual(getCachedDiagnosis(key, 1_000 + 23 * 60 * 60 * 1000), result);
  assert.equal(getCachedDiagnosis(key, 1_000 + 25 * 60 * 60 * 1000), null);
});

test("retry policy only retries temporary failures with exponential delays", () => {
  assert.equal(isTemporaryFailure("rate_limited"), true);
  assert.equal(isTemporaryFailure("upstream"), true);
  assert.equal(isTemporaryFailure("unauthorized"), false);
  assert.deepEqual([retryDelay(1), retryDelay(2), retryDelay(3)], [500, 1000, 2000]);
});
