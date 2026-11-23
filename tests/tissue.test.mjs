import test from "node:test";
import assert from "node:assert/strict";
import { CANCER_TYPES, FACTORS } from "../dist/core/exposure.js";
import { cloneCount, compareCloneCounts, createTissueField, markStrength, tissueChannels } from "../dist/core/tissue.js";

const example = { cancer: "lung", factor: "smoking", initialRate: 20, changedRate: 0, historyYears: 20, changeYear: 0, horizonYears: 20 };
const radon = { ...example, factor: "radon", initialRate: 200, changedRate: 40 };

test("all tissue architectures are bounded, reproducible and distinct", () => {
  const outputs = new Set();
  for (const { id } of CANCER_TYPES) {
    const field = createTissueField(id);
    const repeat = createTissueField(id);
    assert.deepEqual(repeat, field);
    assert.notDeepEqual(createTissueField(id, 93).cells, field.cells);
    assert.ok(field.cells.length > 80 && field.cells.length < 2000);
    for (const [id, cell] of [...field.cells, ...field.clones].entries()) {
      assert.equal(id, cell.id);
      assert.ok(cell.x >= 0 && cell.x <= 300 && cell.y >= 0 && cell.y <= 180);
      assert.ok(cell.rx > 0 && cell.ry > 0);
    }
    outputs.add(JSON.stringify(field.cells.slice(0,4)));
  }
  assert.equal(outputs.size, CANCER_TYPES.length);
});

test("rates update at the switch while both fields retain the shared starting marks", () => {
  for (const changeYear of [0, 3]) {
    const at = tissueChannels("lung", [{...example, changeYear}], changeYear);
    assert.equal(at.continued[0].level, at.changed[0].level);
    assert.equal(at.continued[0].total, at.changed[0].total);
    assert.equal(at.changed[0].rate, 0);
  }
  const {continued,changed} = tissueChannels("lung", [example], 8);
  assert.equal(changed[0].total,20);
  assert.equal(continued[0].total,28);
  assert.ok(changed[0].level < continued[0].level);
  const kept = tissueChannels("lung", [{...example,changedRate:20}], 20);
  assert.deepEqual(kept.continued, kept.changed);
});

test("each enabled factor has its own data and display marks", () => {
  const source = tissueChannels("lung", [example,radon], 15);
  const withNewRadon = tissueChannels("lung", [example,{...radon,changedRate:210}],15);
  assert.notEqual(source.changed[1].level, withNewRadon.changed[1].level);
  assert.deepEqual(source.changed[0], withNewRadon.changed[0]);
  const history = tissueChannels("lung", [{...example,historyYears:0}],15);
  assert.notEqual(source.continued[0].level, history.continued[0].level);
  const cells = createTissueField("lung").cells;
  assert.ok(cells.some(c => markStrength(c,source.continued[0]) > markStrength(c,source.changed[0])));
  for (const {id,factors} of CANCER_TYPES) for (const factor of factors) {
    const def = FACTORS[factor];
    const output = tissueChannels(id,[{...example,cancer:id,factor,initialRate:def.initialRate,changedRate:def.changedRate}],10);
    assert.equal(output.changed[0].unit,def.unit);
    assert.ok(output.changed[0].level >= 0 && output.changed[0].level <= 1);
  }
});

test("only time and the example pace can change the cluster count", () => {
  assert.deepEqual(["steady","slow","fast"].map(p=>cloneCount(0,p)),[5,5,5]);
  assert.equal(cloneCount(50,"steady"),5);
  assert.ok(cloneCount(10,"fast") > cloneCount(10,"slow"));
  assert.equal(cloneCount(10000,"fast"),96);
  for (const factor of ["stress","genetics"]) {
    const channels = tissueChannels("lung",[{...example,factor}],8);
    assert.deepEqual(channels,{continued:[],changed:[]});
  }
  for (const year of [Infinity, NaN, -1]) assert.throws(()=>cloneCount(year),RangeError);
  assert.throws(()=>tissueChannels("lung",[example,example],1),RangeError);
  assert.throws(()=>tissueChannels("oral",[example],1),RangeError);
});

test("an assumed course starts only after the first changed exposure rate", () => {
  for (const course of ["match", "slower", "plateau", "regression"]) {
    for (const [year, changeYear] of [[0,0],[5,10],[10,10],[45,null]]) {
      const pair = compareCloneCounts(year,"slow",course,changeYear);
      assert.equal(pair.continued,pair.changed);
    }
  }
  assert.deepEqual(compareCloneCounts(20,"slow","match",10),{continued:21,changed:21});
  assert.deepEqual(compareCloneCounts(20,"slow","slower",10),{continued:21,changed:15});
  assert.deepEqual(compareCloneCounts(20,"slow","plateau",10),{continued:21,changed:13});
  assert.deepEqual(compareCloneCounts(20,"slow","regression",10),{continued:21,changed:5});
  assert.equal(compareCloneCounts(50,"slow","regression",0).changed,0);
  assert.throws(()=>compareCloneCounts(1,"slow","unknown",0),RangeError);
});
