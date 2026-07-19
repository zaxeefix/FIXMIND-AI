import test from "node:test";
import assert from "node:assert/strict";
import { can, roleHome } from "../lib/permissions.ts";

test("only customers can run AI diagnosis",()=>{assert.equal(can("guest","runAiDiagnosis"),false);assert.equal(can("customer","runAiDiagnosis"),true);assert.equal(can("technician","runAiDiagnosis"),false);assert.equal(can("admin","runAiDiagnosis"),false)});
test("only customers can book repairs",()=>{assert.equal(can("guest","bookRepair"),false);assert.equal(can("customer","bookRepair"),true);assert.equal(can("technician","bookRepair"),false);assert.equal(can("admin","bookRepair"),false)});
test("technician and admin capabilities stay separated",()=>{assert.equal(can("technician","updateRepairProgress"),true);assert.equal(can("technician","manageUsers"),false);assert.equal(can("admin","manageUsers"),true);assert.equal(can("admin","updateRepairProgress"),false)});
test("each authenticated role has a dedicated dashboard",()=>{assert.equal(roleHome("customer"),"/dashboard");assert.equal(roleHome("technician"),"/technician");assert.equal(roleHome("admin"),"/admin")});
