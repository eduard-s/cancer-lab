import assert from "node:assert/strict";
import test from "node:test";
import { CANCER_TYPES, FACTORS, YEAR_LIMITS, projectExposure } from "../dist/core/exposure.js";

const scenario = {
  cancer: "lung", factor: "smoking", initialRate: 20, changedRate: 0,
  historyYears: 10, changeYear: 2, horizonYears: 20,
};

test("quitting retains past pack-years, including a delayed change", () => {
  const result = projectExposure(scenario);
  assert.equal(result.historyTotal, 10);
  assert.deepEqual(result.points[2], { year: 2, continued: 12, changed: 12 });
  assert.equal(result.continuedTotal, 30);
  assert.equal(result.changedTotal, 12);
  assert.deepEqual(result.milestone.window, [10, 15]);
  const oral = projectExposure({ ...scenario, cancer: "oral" });
  assert.deepEqual(oral.milestone.window, [5, 10]);
});

test("the published cessation windows apply only to a full quit after actual exposure", () => {
  for (const changes of [
    { initialRate: 0 }, { changedRate: 5 }, { changedRate: 20 }, { changedRate: 30 },
    { historyYears: 0, changeYear: 0 }, { changeYear: 25 },
  ]) assert.equal(projectExposure({ ...scenario, ...changes }).milestone, null);
  const neverChanged = projectExposure({ ...scenario, changeYear: 25 });
  assert.ok(neverChanged.points.every(p => p.changed === p.continued));
});

test("a fractional change has its own plotted point and correct terminal totals", () => {
  const { points, continuedTotal, changedTotal } = projectExposure({
    ...scenario, historyYears: 0, changedRate: 5, changeYear: 0.5, horizonYears: 1.5,
  });
  assert.deepEqual(points.map(p => p.year), [0, 0.5, 1, 1.5]);
  assert.equal(continuedTotal, 1.5);
  assert.equal(changedTotal, 0.75);
});

test("factor charts convert daily, weekly and work-shift measurements into their own units", () => {
  const examples = [
    ["colorectal", "processed-meat", 50, 0, 18.2625, 0],
    ["breast", "alcohol", 28, 14, 10.227, 5.1135],
    ["breast", "activity", 30, 150, 30 * 365.25 / 7 / 60, 150 * 365.25 / 7 / 60],
    ["lung", "radon", 200, 40, 200, 40],
    ["lung", "secondhand-smoke", 7, 0, 365.25, 0],
    ["lung", "silica", 100, 25, 100, 25],
    ["lung", "diesel-exhaust", 50, 10, 50, 10],
    ["oral", "smokeless-tobacco", 5, 0, 1826.25, 0],
    ["colorectal", "dietary-fiber", 15, 25, 5.47875, 9.13125],
    ["breast", "leisure-sitting", 6, 2, 2191.5, 730.5],
    ["melanoma", "sunscreen", 0, 7, 0, 365.25],
    ["liver", "coffee", 2, 0.5, 730.5, 182.625],
    ["prostate", "selenium", 200, 0, 73.05, 0],
  ];
  for (const [cancer, factor, initialRate, changedRate, continued, changed] of examples) {
    const result = projectExposure({
      cancer, factor, initialRate, changedRate, historyYears: 0, changeYear: 0, horizonYears: 1,
    });
    assert.ok(Math.abs(result.changedTotal - changed) < 1e-10);
    assert.ok(Math.abs(result.continuedTotal - continued) < 1e-10);
  }
});

test("other types of tobacco exposure do not inherit cigarette cessation estimates", () => {
  for (const [cancer, factor] of [["lung", "secondhand-smoke"], ["oral", "smokeless-tobacco"], ["pancreatic", "smokeless-tobacco"]]) {
    const options = { ...scenario, cancer, factor, initialRate: 10, changedRate: 0 };
    const result = projectExposure(options);
    assert.equal(result.milestone, null);
    assert.ok(result.changedTotal > 0 && result.changedTotal < result.continuedTotal);
    assert.notEqual(FACTORS[factor].totalUnit, "pack-years");
  }
});

test("all supported scenarios have sourced context, ordered years and equal traces at identical rates", () => {
  for (const { id: cancer, factors } of CANCER_TYPES) {
    assert.ok(factors.length > 1);
    for (const factor of factors) {
      const { unit, totalUnit, initialRate } = FACTORS[factor];
      assert.ok(unit.length > 0 && totalUnit.length > 0);
      const options = { ...scenario, cancer, factor, initialRate, changedRate: initialRate };
      const { evidence, points } = projectExposure(options);
      assert.ok(evidence.length);
      assert.ok(evidence.every(note => note.headline && note.detail && new URL(note.source.url).protocol === "https:"));
      assert.ok(points.every((p, i) => p.continued === p.changed && (i === 0 || p.year > points[i - 1].year)));
      assert.deepEqual(projectExposure({ ...options, horizonYears: 0 }).points, [points[0]]);
    }
  }
});

test("oral alcohol references reduction evidence independent of a made-up year window", () => {
  const options = { ...scenario, cancer: "oral", factor: "alcohol", initialRate: 28, changedRate: 14 };
  assert.ok(projectExposure(options).milestone.source.url.includes("cancer.gov"));
  assert.equal(projectExposure(options).milestone.window, undefined);
  for (const cancer of ["colorectal", "breast"]) {
    assert.equal(projectExposure({ ...options, cancer }).milestone, null);
  }
});

test("invalid measurements, unsupported factor pairs and nonfinite periods cannot yield results", () => {
  for (const overrides of [
    { cancer: "unknown" }, { factor: "unknown" }, { cancer: "breast", factor: "radon" },
    { historyYears: -1 }, { changeYear: YEAR_LIMITS.changeYear + 1 }, { horizonYears: NaN },
    { initialRate: -1 }, { changedRate: 61 }, { initialRate: Infinity }, { factor: "radon", changedRate: 0 },
  ]) assert.throws(() => projectExposure({ ...scenario, ...overrides }), RangeError);
});

test("adult BMI counts only the years in the indicated category in each path", () => {
  const options = { ...scenario, cancer: "prostate", factor: "bmi", initialRate: 30, changedRate: 29.9 };
  const result = projectExposure(options);
  assert.equal(result.historyTotal, 10);
  assert.equal(result.changedTotal, 12);
  assert.equal(result.continuedTotal, 30);
  const opposite = projectExposure({ ...options, initialRate: 29.9, changedRate: 30 });
  assert.equal(opposite.historyTotal, 0);
  assert.equal(opposite.changedTotal, 18);
  assert.equal(opposite.continuedTotal, 0);
  assert.equal(result.milestone, null);
});

test("new factors preserve counts and concentrations without assigning recovery rates", () => {
  const rows = [
    ["melanoma", "sunburns", 0.25, 0, 1, 0],
    ["melanoma", "indoor-tanning", 12, 0, 48, 0],
    ["prostate", "vitamin-e", 400, 0, 584400, 0],
    ["lung", "pm25", 20, 5, 80, 20],
    ["oral", "areca", 4, 2, 5844, 2922],
  ];
  for (const [cancer, factor, initialRate, changedRate, continued, changed] of rows) {
    const result = projectExposure({ cancer, factor, initialRate, changedRate, historyYears: 0, changeYear: 0, horizonYears: 4 });
    assert.equal(result.continuedTotal, continued);
    assert.equal(result.changedTotal, changed);
    assert.equal(result.milestone, null);
  }
  assert.equal(projectExposure({ ...scenario, cancer: "pancreatic" }).milestone.label, "About 20 years after quitting");
  for (const cancer of ["liver", "colorectal"]) assert.equal(projectExposure({ ...scenario, cancer }).milestone, null);
  assert.ok(projectExposure({ ...scenario, cancer: "oral", factor: "areca" }).milestone.source.url.includes("iarc.who.int"));
});
