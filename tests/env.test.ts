import test from "node:test";
import assert from "node:assert/strict";
import { parseServerEnv } from "../lib/env.ts";

test("blank optional credentials do not crash public routes",()=>{
  const env=parseServerEnv({TECHNICIAN_PASSWORD:"",ADMIN_PASSWORD:"",DEMO_USER_PASSWORD:"",AUTH_SECRET:"",DATABASE_URL:"",OPENAI_SIMULATE_FAILURE:""});
  assert.equal(env.TECHNICIAN_PASSWORD,undefined);
  assert.equal(env.ADMIN_PASSWORD,undefined);
  assert.equal(env.AUTH_SECRET,undefined);
  assert.equal(env.OPENAI_DIAGNOSIS_MODEL,"gpt-5.6-terra");
  assert.equal(env.HACKATHON_DEMO,false);
});
