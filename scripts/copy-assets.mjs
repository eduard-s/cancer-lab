import { cp, readFile, writeFile } from "node:fs/promises";

const source = new URL("../src/react/", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
let styles = await readFile(new URL("styles.css", source), "utf8");
for (const name of ["TissueFigure.css", "TumorWorkbench.css", "LiveTissue.css", "Scenario.css"]) {
  const fragment = await readFile(new URL(name, source), "utf8");
  styles = styles.replace(`@import "./${name}";`, () => fragment);
}
await writeFile(new URL("styles.css", dist), styles);
await cp(new URL("tissue/", source), new URL("tissue/", dist), { recursive: true });
