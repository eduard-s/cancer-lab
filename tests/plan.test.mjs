import assert from "node:assert/strict";
import test from "node:test";
import { comparePlan } from "../dist/core/index.js";

const smoking = { cancer: "lung", factor: "smoking", initialRate: 20, changedRate: 0, historyYears: 10, horizonYears: 20, changeYear: 2 };
const radon = { ...smoking, factor: "radon", initialRate: 200, changedRate: 40, changeYear: 7 };

test("counts time with joint changes and preserves individual units", () => {
  const result = comparePlan([smoking, radon], 12);
  assert.deepEqual(result.rows.map(row => row.changedTotal), [12, 3600]);
  assert.deepEqual(result.rows.map(row => row.yearsAtNewRate), [10, 5]);
  assert.equal(result.allChangesOverlapYears, 5);
  assert.equal(comparePlan([smoking, radon], 6).rows[1].planRate, 200);
  assert.equal(comparePlan([smoking, radon], 6).allChangesOverlapYears, 0);
  assert.equal(comparePlan([smoking, radon], 7).rows[1].planRate, 40);
});
test("distinguishes omitted factors and unchanged settings", () => {
  assert.equal(comparePlan([], 0).rows.length, 0);
  assert.equal(comparePlan([{ ...smoking, changedRate: 20 }], 20).scheduledChanges, 0);
  assert.throws(() => comparePlan([smoking, smoking], 2), RangeError);
  assert.throws(() => comparePlan([smoking, { ...radon, horizonYears: 10 }], 2), RangeError);
  assert.throws(() => comparePlan([smoking], 30), RangeError);
});
