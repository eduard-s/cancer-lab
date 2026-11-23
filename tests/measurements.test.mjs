import assert from "node:assert/strict";
import test from "node:test";
import { compareFromOneCm3, compareScans, measureInterval } from "../dist/core/index.js";

const scan = (day, volumeCm3) => ({ day, volumeCm3 });
test("uses elapsed days, not raw volume differences, to compare growth", () => {
  assert.equal(compareScans(scan(0, 1), scan(90, 2), scan(270, 4)).trend, "lower");
  assert.equal(compareScans(scan(0, 1), scan(90, 2), scan(270, 8)).trend, "same");
  assert.equal(compareScans(scan(0, 1), scan(90, 2), scan(135, 4)).trend, "higher");
  assert.equal(measureInterval(scan(0, 1), scan(90, 2)).doublingDays, 90);
});
test("distinguishes shrinkage and equal volumes from positive doubling time", () => {
  const stable = measureInterval(scan(0, 1), scan(90, 1));
  assert.equal(stable.doublingDays, null);
  assert.equal(stable.halvingDays, null);
  const smaller = measureInterval(scan(0, 2), scan(90, 1));
  assert.equal(smaller.doublingDays, null);
  assert.equal(smaller.halvingDays, 90);
  assert.equal(smaller.percentChange, -50);
});
test("rejects impossible measurements", () => {
  for (const bad of [scan(0, 1), scan(2, 0), scan(-5, 1), scan(30, NaN), scan(Infinity, 1)]) {
    assert.throws(() => measureInterval(scan(0, 1), bad), RangeError);
  }
});

test("equal starting volumes preserve rate differences over a common observed duration", () => {
  const rates = compareScans(scan(0, 2), scan(90, 4), scan(135, 8));
  assert.deepEqual(compareFromOneCm3(rates, 0), { days: 0, maxDays: 45, earlierCm3: 1, laterCm3: 1 });
  const end = compareFromOneCm3(rates, 45);
  assert.ok(Math.abs(end.earlierCm3 - Math.sqrt(2)) < 1e-12);
  assert.ok(Math.abs(end.laterCm3 - 2) < 1e-12);
  for (const invalid of [-1, 45.01, Infinity, NaN]) assert.throws(() => compareFromOneCm3(rates, invalid), RangeError);
});

test("equal-start volumes can shrink or remain unchanged", () => {
  const comparison = compareScans(scan(0, 8), scan(90, 4), scan(180, 4));
  const result = compareFromOneCm3(comparison, 90);
  assert.ok(Math.abs(result.earlierCm3 - 0.5) < 1e-12);
  assert.equal(result.laterCm3, 1);
});
