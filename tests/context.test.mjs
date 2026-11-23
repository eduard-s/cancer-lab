import assert from "node:assert/strict";
import test from "node:test";
import { adultBmi, describeContext, GENETIC_PROFILES, MEDICAL_HISTORIES, medicalHistoryNotes, STRESS_SCALE } from "../dist/core/context.js";
import { CANCER_TYPES, projectExposure } from "../dist/core/exposure.js";

const selection = { cancer: "breast", familyHistory: "unknown", geneticProfile: null, stressScore: null };

test("each cancer has sourced inherited profiles and all family-history options", () => {
  assert.deepEqual(Object.keys(GENETIC_PROFILES).sort(), CANCER_TYPES.map(site => site.id).sort());
  for (const [cancer, profiles] of Object.entries(GENETIC_PROFILES)) {
    assert.ok(profiles.length);
    for (const item of profiles) {
      for (const familyHistory of ["none-reported", "first-degree", "unknown"]) {
        const notes = describeContext({ ...selection, cancer, geneticProfile: item.id, familyHistory });
        assert.equal(notes.genetics.headline, item.label);
        assert.ok(item.mechanism && item.detail && notes.family.detail);
        for (const note of Object.values(notes)) assert.equal(new URL(note.source.url).protocol, "https:");
      }
    }
  }
});

test("a completed PSS score includes the endpoints and distinguishes a zero from an absent score", () => {
  assert.equal(STRESS_SCALE.period, "Previous month");
  for (const stressScore of [0, 20, 40]) assert.ok(describeContext({ ...selection, stressScore }).stress.headline.includes(stressScore + " of 40"));
  assert.match(describeContext(selection).stress.headline, /No stress score/);
  for (const stressScore of [-1, 40.5, 12.1, NaN, Infinity, "20"]) assert.throws(() => describeContext({ ...selection, stressScore }), RangeError);
});

test("inherited findings are site-specific and contextual inputs never change exposure totals", () => {
  assert.throws(() => describeContext({ ...selection, geneticProfile: "egfr-t790m" }), RangeError);
  assert.throws(() => describeContext({ ...selection, cancer: "unknown" }), RangeError);
  assert.throws(() => describeContext({ ...selection, familyHistory: "unspecified" }), RangeError);
  const config = { cancer: "breast", factor: "alcohol", initialRate: 14, changedRate: 0, historyYears: 12, changeYear: 1, horizonYears: 20 };
  assert.deepEqual(projectExposure(config), projectExposure({ ...config, geneticProfile: "brca2", stressScore: 40, familyHistory: "first-degree" }));
});

test("adult BMI uses centimeters and rejects invalid dimensions", () => {
  assert.equal(adultBmi(100, 200), 25);
  for (const [kg, cm] of [[-1, 150], [60, 0], [NaN, 170], [60, Infinity], [80, Number.MIN_VALUE]]) {
    assert.throws(() => adultBmi(kg, cm), RangeError);
  }
});

test("successive PSS-10 totals give a signed change in points only when both are present", () => {
  for (const [first, second, expected] of [[40, 0, -40], [0, 40, 40], [7, 7, 0], [32, 31, -1]]) {
    const note = describeContext({ ...selection, stressScore: first, nextStressScore: second }).stress;
    assert.equal(note.changePoints, expected);
    assert.match(note.headline, new RegExp(first + " to " + second));
  }
  assert.equal(describeContext(selection).stress.changePoints, null);
  assert.equal(describeContext({ ...selection, stressScore: 20 }).stress.changePoints, null);
  assert.throws(() => describeContext({ ...selection, nextStressScore: 20 }), RangeError);
  for (const nextStressScore of [41, 2.5, -1, NaN]) {
    assert.throws(() => describeContext({ ...selection, stressScore: 3, nextStressScore }), RangeError);
  }
});

test("site-specific medical histories support combinations and keep their own sources", () => {
  assert.deepEqual(medicalHistoryNotes(selection), []);
  const liver = { ...selection, cancer: "liver", medicalHistory: ["hepatitis-c", "cirrhosis"] };
  assert.deepEqual(medicalHistoryNotes(liver).map(note => note.headline), ["Chronic hepatitis C", "Cirrhosis"]);
  assert.match(medicalHistoryNotes(liver)[0].detail, /heavy alcohol use/);
  for (const [cancer, conditions] of Object.entries(MEDICAL_HISTORIES)) {
    assert.ok(medicalHistoryNotes({ ...selection, cancer, medicalHistory: conditions.map(c => c.id) }).every(note => note.detail && new URL(note.source.url).protocol === "https:"));
  }
  assert.throws(() => medicalHistoryNotes({ ...liver, cancer: "breast" }), RangeError);
  assert.throws(() => medicalHistoryNotes({ ...liver, medicalHistory: ["cirrhosis", "cirrhosis"] }), RangeError);
});
