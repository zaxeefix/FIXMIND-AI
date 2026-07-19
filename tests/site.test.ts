import assert from "node:assert/strict";
import test from "node:test";
import { getSiteUrl } from "../lib/site.ts";

test("site URL uses the configured production origin", () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://fixmind.example/path";
  assert.equal(getSiteUrl(), "https://fixmind.example");
  if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = previous;
});

test("site URL safely falls back when configuration is invalid", () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "not a valid URL";
  assert.equal(getSiteUrl(), "https://fixmind-ai.vercel.app");
  if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = previous;
});
