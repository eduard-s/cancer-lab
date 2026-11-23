"use client";

import { useState } from "react";
import type { CancerId } from "../core/exposure.js";
import { compareFromOneCm3, compareScans, VOLUME_METHOD, type Scan } from "../core/measurements.js";
import { AfterDiagnosis } from "./AfterDiagnosis.js";
import { format, RangeControl } from "./controls.js";

const examples = [
  { title: "Same growth rate", lastVolume: 8 },
  { title: "Slower growth", lastVolume: 5 },
  { title: "Faster growth", lastVolume: 12 },
  { title: "No further growth", lastVolume: 4 },
  { title: "Shrinkage", lastVolume: 2 },
];

function exampleScans(lastVolume: number) {
  return { firstVolume: 2, middleVolume: 4, lastVolume, firstInterval: 90, secondInterval: 90 };
}

function ScanFigure({ scans }: { scans: Scan[] }) {
  // The 10 mm scale bar spans 20 units in each SVG.
  const drawingUnitsPerMm = 2;
  return <figure className="cl-scans-figure">
    <div className="cl-scans-strip">
      {scans.map(({ day, volumeCm3 }, i) => {
        const diameterMm = 10 * Math.cbrt(6 * volumeCm3 / Math.PI);
        return <div className="cl-scan" key={i}>
          <span className="cl-scan-name">Scan {i + 1}</span>
          <span className="cl-scan-day">Day {day}</span>
          <svg className="cl-scan-circle" viewBox="0 0 120 118" aria-hidden="true">
            <path className="cl-scan-axis" d="M7 50h106 M60 5v90" />
            <circle className="cl-scan-shape" cx="60" cy="50" r={diameterMm * drawingUnitsPerMm / 2} />
            <path className="cl-scan-ruler" d="M50 98v5 m0 -2.5h20 M70 98v5" />
            <text className="cl-scan-scale-label" x="60" y="115" textAnchor="middle">10 mm</text>
          </svg>
          <strong className="cl-scan-volume">{format(volumeCm3)} cm³</strong>
          <span className="cl-scan-diameter">{format(diameterMm)} mm diameter</span>
        </div>;
      })}
    </div>
    <figcaption>Each circle shows the diameter of a sphere with the selected volume. All three diagrams use the same scale.</figcaption>
  </figure>;
}

function intervalTime(interval: ReturnType<typeof compareScans>["earlier"]) {
  if (interval.doublingDays !== null) return format(interval.doublingDays) + " days to double";
  if (interval.halvingDays !== null) return format(interval.halvingDays) + " days to halve";
  return "Volume unchanged";
}

const volumeText = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 4 });

function EqualStartComparison({ comparison }: { comparison: ReturnType<typeof compareScans> }) {
  const [chosenDays, setChosenDays] = useState<number | null>(null);
  const maxDays = Math.min(comparison.earlier.days, comparison.later.days);
  const days = Math.min(chosenDays ?? maxDays, maxDays);
  const selected = compareFromOneCm3(comparison, days);
  const end = compareFromOneCm3(comparison, maxDays);
  const axisMax = Math.max(1, end.earlierCm3, end.laterCm3);
  const rows = [
    { label: "Scans 1–2 rate", value: selected.earlierCm3 },
    { label: "Scans 2–3 rate", value: selected.laterCm3 },
  ];
  return <section className="cl-equal-start">
    <h3>Compare rates from 1 cm³</h3>
    <p>Both examples start at 1 cm³. Each uses the proportional rate measured between its two scans.</p>
    <RangeControl label="Comparison duration" unit="days" value={days} min={0} max={maxDays} onChange={setChosenDays} />
    <p className="cl-rate-duration">The shorter scan interval sets the limit of {maxDays} {maxDays === 1 ? "day" : "days"}.</p>
    <figure className="cl-rate-bars">
      <figcaption>Volume after {days} {days === 1 ? "day" : "days"}</figcaption>
      {rows.map(row => <div className="cl-rate-row" key={row.label}>
        <div><span>{row.label}</span><strong>{volumeText.format(row.value)} cm³</strong></div>
        <div className="cl-rate-track" aria-hidden="true">
          <i style={{ width: (100 * row.value / axisMax) + "%" }} />
          <span style={{ left: (100 / axisMax) + "%" }} />
        </div>
      </div>)}
      <div className="cl-rate-key">The vertical mark shows the common starting volume of 1 cm³.</div>
    </figure>
  </section>;
}

export function TumorWorkbench({ cancer }: { cancer: CancerId }) {
  const [values, setValues] = useState(() => exampleScans(5));
  const input = (key: keyof typeof values, value: number) =>
    setValues(previous => ({ ...previous, [key]: value }));
  const { firstVolume, middleVolume, lastVolume, firstInterval, secondInterval } = values;
  const matchesPreset = firstVolume === 2 && middleVolume === 4 && firstInterval === 90 && secondInterval === 90;
  const preset = matchesPreset ? examples.find(example => example.lastVolume === lastVolume) : undefined;
  const first = { day: 0, volumeCm3: firstVolume };
  const middle = { day: firstInterval, volumeCm3: middleVolume };
  const last = { day: firstInterval + secondInterval, volumeCm3: lastVolume };
  const comparison = compareScans(first, middle, last);
  const { earlier, later, trend } = comparison;

  let summary = "Both intervals have the same proportional rate of volume change.";
  if (trend !== "same") summary = `The second interval has a ${trend} proportional rate of volume change.`;
  if (later.logRatePerDay > 0 && trend === "lower") summary = "The volume still increases in the second interval, but at a slower rate.";

  return <section className="cl-scans">
    <h2>Compare tumor measurements</h2>
    <p>These three illustrative scans represent one tumor. You set the volumes and scan dates independently of the exposure history.</p>
    <div className="cl-scans-layout">
      <ScanFigure scans={[first, middle, last]} />
      <div className="cl-scan-controls">
        <fieldset className="cl-scan-examples">
          <legend>Example scans</legend>
          <div className="cl-presets cl-scan-options">
            {examples.map(example => <button type="button" key={example.title}
              aria-pressed={preset === example}
              onClick={() => setValues(exampleScans(example.lastVolume))}>
              {example.title}
            </button>)}
          </div>
          <span className="cl-scan-status" role="status">{preset ? "" : "Custom scans"}</span>
        </fieldset>
        <fieldset>
          <legend>Tumor volume</legend>
          <RangeControl label="Scan 1 volume" unit="cm³" value={firstVolume} min={0.1} max={40} step={0.1} onChange={value => input("firstVolume", value)} />
          <RangeControl label="Scan 2 volume" unit="cm³" value={middleVolume} min={0.1} max={40} step={0.1} onChange={value => input("middleVolume", value)} />
          <RangeControl label="Scan 3 volume" unit="cm³" value={lastVolume} min={0.1} max={40} step={0.1} onChange={value => input("lastVolume", value)} />
        </fieldset>
        <fieldset>
          <legend>Time between scans</legend>
          <RangeControl label="Scans 1 to 2" unit="days" value={firstInterval} min={1} max={365} onChange={value => input("firstInterval", value)} />
          <RangeControl label="Scans 2 to 3" unit="days" value={secondInterval} min={1} max={365} onChange={value => input("secondInterval", value)} />
        </fieldset>
      </div>
      <div className="cl-scan-results">
        <table className="cl-scan-table">
          <caption>Change between scans</caption>
          <thead><tr><th scope="col">Interval</th><th scope="col">Volume change</th><th scope="col">At this rate</th></tr></thead>
          <tbody>
            {[earlier, later].map((interval, i) => <tr key={i}>
              <th scope="row">Days {i === 0 ? first.day : middle.day}–{i === 0 ? middle.day : last.day}</th>
              <td>{interval.percentChange > 0 ? "+" : ""}{format(interval.percentChange)}%</td>
              <td>{intervalTime(interval)}</td>
            </tr>)}
          </tbody>
        </table>
        <p className="cl-scan-summary" aria-live="polite">{summary}</p>
        <EqualStartComparison comparison={comparison} />
      </div>
    </div>
    <section className="cl-scan-method">
      <h3>How to read the change</h3>
      <p>Each interval uses the ratio of two volumes and the time between scans. The calculation assumes a constant proportional rate within that interval. <a href={VOLUME_METHOD.url}>Wilson et al., volume method</a></p>
      <p>Repeat scans can give different volume measurements for the same tumor. A small difference can reflect measurement variability. These examples cannot establish what caused a change. <a href="https://pubmed.ncbi.nlm.nih.gov/19561260/">Zhao et al., repeat CT study</a></p>
    </section>
    <AfterDiagnosis cancer={cancer} />
  </section>;
}
