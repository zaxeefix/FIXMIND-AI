import test from "node:test";
import assert from "node:assert/strict";
import { adminModules, parseAdminModule } from "../lib/admin-modules.ts";

test("admin modules are unique and route-safe", () => {
  assert.equal(new Set(adminModules).size, adminModules.length);
  assert.equal(parseAdminModule("reports"), "reports");
  assert.equal(parseAdminModule("settings"), "settings");
  assert.equal(parseAdminModule("invalid"), "overview");
  assert.equal(parseAdminModule(undefined), "overview");
});
