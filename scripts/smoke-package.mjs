import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const temp = mkdtempSync(join(tmpdir(), "cancer-lab-package-"));
const run = (bin, args, cwd = temp) => execFileSync(bin, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const install = (...packages) => run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", ...packages]);
const node = code => run(process.execPath, ["--input-type=module", "-e", code]);
try {
  const [pack] = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", temp], root));
  const paths = pack.files.map(file => file.path);
  for (const file of ["dist/styles.css", "docs/MODEL.md", "docs/TISSUE.md", "README.md", "LICENSE"]) assert(paths.includes(file), file);
  for (const tissue of ["lung", "oral", "colorectal", "breast"]) assert(paths.includes("dist/tissue/" + tissue + ".webp"), tissue);
  writeFileSync(join(temp, "package.json"), JSON.stringify({ private: true, type: "module" }));
  install(join(temp, pack.filename));
  const lock = JSON.parse(readFileSync(join(temp, "package-lock.json"), "utf8"));
  assert(!lock.packages["node_modules/react"]);
  node(`
    import assert from "node:assert/strict";
    import { readFileSync } from "node:fs";
    import { CANCER_TYPES, projectExposure, compareScans, createTissueField, compareCloneCounts, describeContext } from "@esmirnov.ai/cancer-lab/core";
    assert.equal(CANCER_TYPES.length, 8);
    assert(createTissueField("pancreatic").cells.length > 0);
    const counts = compareCloneCounts(10, "slow", "plateau", 0);
    assert(counts.continued > counts.changed);
    assert(describeContext({cancer:"breast", geneticProfile:"brca2", familyHistory:"unknown", stressScore:null}).genetics.headline.includes("BRCA2"));
    const result = projectExposure({ cancer: "lung", factor: "smoking", initialRate: 20, changedRate: 0, historyYears: 20, changeYear: 0, horizonYears: 20 });
    assert.deepEqual([result.continuedTotal, result.changedTotal], [40, 20]);
    assert.equal(compareScans({day:0,volumeCm3:2},{day:90,volumeCm3:4},{day:180,volumeCm3:8}).trend,"same");
    const css = readFileSync(new URL(import.meta.resolve("@esmirnov.ai/cancer-lab/styles.css")), "utf8");
    assert(!css.includes("@import"));
    assert(css.includes("./tissue/lung.webp"));
  `);
  writeFileSync(join(temp, "consumer.mts"), `import { CANCER_TYPES, type CancerId } from "@esmirnov.ai/cancer-lab/core";
    const cancer: CancerId = CANCER_TYPES[0].id;`);
  run(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "--strict", "--skipLibCheck", "--noEmit", "--target", "ES2022", "--module", "NodeNext", "consumer.mts"]);
  for (const version of ["18.3.1", "19.2.6"]) {
    install("react@" + version, "react-dom@" + version);
    node(`
      import assert from "node:assert/strict";
      import React from "react";
      import { renderToString } from "react-dom/server";
      import { CancerLab } from "@esmirnov.ai/cancer-lab";
      import { CancerLab as alias } from "@esmirnov.ai/cancer-lab/react";
      import { CANCER_TYPES } from "@esmirnov.ai/cancer-lab/core";
      assert.equal(CancerLab, alias);
      for (const { id } of CANCER_TYPES) {
        const html = renderToString(React.createElement(CancerLab, { initialCancer: id }));
        assert.equal((html.match(/<canvas/g) ?? []).length, 2);
        assert(html.includes("Assumed course after change"));
        assert(html.includes("Combine changes"));
        assert(html.includes("Inherited finding"));
        assert(html.includes("Perceived stress"));
        assert(html.includes("Exposure history"));
        assert(!html.includes("<select"), "All choices must stay visible.");
      }
    `);
  }
  console.log("Passed clean npm installation, typed core without React, image paths, and React 18/19 server rendering.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
