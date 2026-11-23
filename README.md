# Cancer Lab

Cancer Lab compares two tissue illustrations that start with the same cells. Select lung, oral cavity, colorectal, breast, melanoma, liver, prostate, or pancreatic cancer.

Change multiple exposures and inspect the same cell in both plans. The markings on cells show the exposure history. The lab also shows the evidence for inherited conditions and reported stress. Four cancer types include a separate reference photograph.

The tumor view uses three example scans. It shows whether the growth rate changes between two intervals. Exposure settings alone cannot predict the growth rate of an existing tumor.

## Use the lab

1. Select a cancer type. **Exposure settings** shows a row for each factor that applies to that cancer.
2. Use the checkbox in each row to choose which factors to compare.
3. Enter the current and planned rates in each row. Each row shows its own unit.
4. Select a factor name to adjust its exposure history and change date.
5. Set the number of years from today.
6. Move the tissue clock to inspect a year.
7. Compare the two tissue fields and the totals for that year.

For example, select **Lung** to compare radon and outdoor particles. Clear the cigarette checkbox if the example excludes smoking. Change radon in Bq/m³ and outdoor particles in µg/m³. The table shows both totals separately.

To explore different tumor courses, choose a pace for the illustrative cluster. Then select an assumed course for the changed plan. The two clusters share the same history until the first scheduled rate change.

**Match pace** keeps both clusters equal. **Slower expansion**, **Plateau**, and **Regression** show other possible courses. These are choices for the illustration. The exposure levels alone cannot determine which course a tumor will take.

In **Combine changes**, select **Stagger by 5 years** to give each included factor a different start date. **Change all today** restores the example rates for all included factors. **Keep all current rates** makes the two exposure histories identical.

Select **Genetics & stress** to set an inherited finding, a family history, and an optional stress score. Use a completed PSS-10 total for the previous month. Add a second monthly total to compare the scores in points. Some cancer types also have a medical history panel. The background applies to both plans. The evidence for that background does not determine the growth rate of one tumor.

For a complete stop, select **Stop now** on a cigarette, alcohol, or processed meat scenario. For radon, set the concentration after mitigation. For physical activity, set the minutes per week. For adult body mass index (BMI), you can enter height in centimeters and weight in kilograms. Apply the result to the current or new BMI.

Each factor keeps its own rates, history, and change date. All factors for one cancer type share the same end date. The table gives each factor in its own unit. The lab does not calculate a combined cancer risk.

For tumor growth, select **Tumor measurements**. Select an example or adjust the three volumes and the two time intervals. The examples include faster growth, slower growth, equal growth rates, unchanged volume, and shrinkage. The equal-start comparison gives both rates the same initial volume and duration.

## Install the package

Use Node.js 22.12 or later. From your project directory, install Cancer Lab from the public npm registry.

```sh
npm install @esmirnov.ai/cancer-lab
```

For a React application, use React 18.2 or a later version through React 19. Import the stylesheet once in the application.

```tsx
import { CancerLab } from "@esmirnov.ai/cancer-lab";
import "@esmirnov.ai/cancer-lab/styles.css";

export default function Example() {
  return <CancerLab initialCancer="lung" initialView="exposure" />;
}
```

The root export and the `/react` export provide the same component. Both properties are optional.

| Property | Values | Default |
| --- | --- | --- |
| `initialCancer` | `lung`, `oral`, `colorectal`, `breast`, `melanoma`, `liver`, `prostate`, `pancreatic` | `lung` |
| `initialView` | `exposure`, `context`, `measurements` | `exposure` |

## Use the TypeScript core

Import the core to make a comparison without React. The catalog gives the units, limits, and supported factors for each cancer type.

```ts
import { comparePlan, FACTORS, type ExposureScenario } from "@esmirnov.ai/cancer-lab/core";

const history = { cancer: "lung", historyYears: 10, horizonYears: 10 } as const;
const exposures: ExposureScenario[] = [
  { ...history, factor: "radon", initialRate: 200, changedRate: 40, changeYear: 0 },
  { ...history, factor: "pm25", initialRate: 20, changedRate: 8, changeYear: 5 },
];

const result = comparePlan(exposures, 10);
for (const row of result.rows) {
  console.log(FACTORS[row.factor].label, row.continuedTotal, row.changedTotal, FACTORS[row.factor].totalUnit);
}
// Indoor radon: 4000 and 2400 Bq·years/m³
// Outdoor fine particles: 400 and 340 µg·years/m³
```

Year zero represents today. Each scenario in a plan must use the same cancer type and end year. Each factor can appear once. In this example, both changes apply for the last five years.

For one factor, `projectExposure(scenario)` also gives chart points and study references. Some studies give a time interval for a change in risk after exposure stops. An unsupported factor or a value outside the model limits causes a `RangeError`.

Use `createTissueField(cancer, seed)` to create a repeatable synthetic field. Use `tissueChannels(cancer, scenarios, year)` for the exposure marks. Use `compareCloneCounts(year, pace, course, changeYear)` for the two illustrative cluster sizes. The exposure amounts do not set the cluster pace.

`GENETIC_PROFILES` lists the inherited findings for each cancer. `describeContext` gives the source and interpretation for a selected finding, family history, and PSS-10 total.

For the scan comparison, enter the volume of the same lesion in cubic centimeters. Enter each scan day in increasing order.

```ts
import { compareScans } from "@esmirnov.ai/cancer-lab/core";

const result = compareScans(
  { day: 0, volumeCm3: 2 },
  { day: 90, volumeCm3: 4 },
  { day: 180, volumeCm3: 5 },
);

console.log(result.trend);              // "lower"
console.log(result.earlier.doublingDays); // 90
console.log(result.later.doublingDays);   // about 280
```

`measureInterval` compares two scans. It returns the percent change and the proportional growth rate per day. A volume decrease gives a halving time. Equal volumes give `null` for both doubling time and halving time.

## Run the local demo

Install the development dependencies.

```sh
npm ci
```

Start the demo server.

```sh
npm run dev
```

Open the local demo at port 4186. [Cancer Lab](http://127.0.0.1:4186/)

Use these commands for the type checks, model tests, package installation tests, and static demo.

```sh
npm run typecheck
npm test
npm run test:package
npm run build:demo
```

To make an npm archive from the source directory, run this command.

```sh
npm pack
```

## Evidence and licenses

The model guide gives the unit conversions, study populations, and limits of each comparison. [Model guide](docs/MODEL.md)

The code uses the MIT license. The four tissue images use the licenses in the image guide. [Code license](LICENSE) · [Tissue images and licenses](docs/TISSUE.md)
