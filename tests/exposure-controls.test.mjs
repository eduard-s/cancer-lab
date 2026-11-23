import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CANCER_TYPES, FACTORS } from "../dist/core/index.js";
import { CancerLab } from "../dist/react/index.js";

for (const cancer of CANCER_TYPES) {
  test(`${cancer.label} shows current and planned rate editors for every exposure on first render`, () => {
    const html = renderToStaticMarkup(createElement(CancerLab, { initialCancer: cancer.id }));
    const numbers = [...html.matchAll(/<input\b[^>]*>/g)]
      .map(([tag]) => tag)
      .filter(tag => tag.includes('type="number"'));
    for (const id of cancer.factors) {
      const factor = FACTORS[id];
      for (const [period, amount] of [["current", factor.initialRate], ["planned", factor.changedRate]]) {
        const label = `${factor.label} ${period} rate in ${factor.unit}`;
        const matches = numbers.filter(tag => tag.includes(`aria-label="${label}"`));
        assert.equal(matches.length, 1, `Expected one editor for ${label}`);
        assert(matches[0].includes(`value="${amount}"`), `Wrong initial value for ${label}`);
      }
    }
  });
}
