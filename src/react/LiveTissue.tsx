"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type CancerId, type ExposureScenario, type FactorId } from "../core/exposure.js";
import { compareCloneCounts, createTissueField, markStrength, TISSUE_ARCHITECTURES, tissueChannels,
  type ClusterCourse, type ClusterPace, type TissueCell, type TissueChannel, type TissueField } from "../core/tissue.js";
import { format, RangeControl } from "./controls.js";
import { fieldView, paintField } from "./tissue-renderer.js";

interface LiveProps {
  cancer: CancerId;
  scenarios: readonly ExposureScenario[];
  selectedFactor?: FactorId;
  horizonYears?: number;
  year?: number;
  onYearChange?: (year: number) => void;
  active?: boolean;
  settings?: ReactNode;
  inheritedFinding?: { label: string; mechanism?: string };
}

function ChannelSymbol({ symbol, color }: Pick<TissueChannel, "symbol" | "color">) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="#e7c4d4" />
    <circle cx="10" cy="10" r="3" fill="#925f86" />
    <g stroke={color} fill="none" strokeWidth="2">
      {symbol === "arc" && <path d="M4 14a7 7 0 0 1 7-11"/>}
      {symbol === "ring" && <circle cx="10" cy="10" r="6"/>}
      {symbol === "dots" && <path d="M14 9h.2 M13 13h.2" strokeWidth="3.4" strokeLinecap="round"/>}
      {symbol === "bar" && <path d="m6 15 8-3"/>}
      {symbol === "diamond" && <path d="m10 3 4 4-4 4-4-4z"/>}
    </g>
  </svg>;
}

function TissuePane({ label, field, cells, count, channels, zoom, selected, selectedFactor, inheritedLabel, onInspect }: {
  label: string; field: TissueField; cells: TissueCell[]; channels: TissueChannel[];
  count: number; zoom: boolean; selected?: TissueCell; selectedFactor?: FactorId; onInspect: (cell: TissueCell) => void;
  inheritedLabel?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const view = fieldView(zoom, selected);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    function draw() {
      if (!canvas || !ctx) return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(bounds.width * dpr), height = Math.round(bounds.height * dpr);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      paintField(ctx, field, cells, channels, view, selectedFactor, selected && cells[selected.id], !!inheritedLabel);
    }
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [field, cells, channels, view.x, view.y, view.width, view.height, selectedFactor, selected, inheritedLabel]);

  return <figure className="cl-live-pane">
    <figcaption><strong>{label}</strong><small>{count} cluster cells</small></figcaption>
    <canvas ref={ref} width={300} height={180} role="img" aria-label={label + " synthetic tissue field. " + (inheritedLabel ? "The nucleus annotation represents the shared inherited finding, " + inheritedLabel + ". " : "") + "Use the cell inspection buttons for a text description."}
      onClick={event => {
        const box = event.currentTarget.getBoundingClientRect();
        const x = view.x + (event.clientX - box.left) / box.width * view.width;
        const y = view.y + (event.clientY - box.top) / box.height * view.height;
        const cell = cells.reduce((a, b) => Math.hypot(b.x - x, b.y - y) <= Math.hypot(a.x - x, a.y - y) ? b : a);
        onInspect(cell);
      }}>
      {label} synthetic field. The table gives the values for each mark.
    </canvas>
  </figure>;
}

const paces: readonly [ClusterPace, string][] = [["steady", "Fixed"], ["slow", "Slow"], ["fast", "Fast"]];
const courses: readonly [ClusterCourse, string][] = [
  ["match", "Match pace"], ["slower", "Slower expansion"], ["plateau", "Plateau"], ["regression", "Regression"],
];

export function LiveTissue({ cancer, scenarios, selectedFactor, horizonYears, year, onYearChange, active = true, settings, inheritedFinding }: LiveProps) {
  const limit = horizonYears ?? scenarios[0]?.horizonYears ?? 20;
  const [localYear, setLocalYear] = useState(limit);
  const shown = Math.max(0, Math.min(limit, year ?? localYear));
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [pace, setPace] = useState<ClusterPace>("slow");
  const [course, setCourse] = useState<ClusterCourse>("match");
  const [focus, setFocus] = useState<{ cancer: CancerId; id: number }>();
  function changeYear(value: number) {
    setLocalYear(value);
    onYearChange?.(value);
  }
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hide = () => { if (document.hidden) setPlaying(false); };
    const motion = () => { if (media.matches) setPlaying(false); };
    document.addEventListener("visibilitychange", hide); media.addEventListener("change", motion);
    return () => { document.removeEventListener("visibilitychange", hide); media.removeEventListener("change", motion); };
  }, []);
  useEffect(() => {
    if (!playing || !active) return;
    if (shown >= limit || document.hidden) { setPlaying(false); return; }
    const timer = window.setTimeout(() => changeYear(Math.min(limit, Math.round((shown + .25) * 4) / 4)), 150);
    return () => window.clearTimeout(timer);
  }, [playing, active, shown, limit, onYearChange]);

  const field = useMemo(() => createTissueField(cancer), [cancer]);
  const scheduled = scenarios.filter(s => s.initialRate !== s.changedRate).map(s => s.changeYear);
  const forkYear = scheduled.length ? Math.min(...scheduled) : null;
  const counts = compareCloneCounts(shown, pace, course, forkYear);
  const cells = useMemo(() => [...field.cells, ...field.clones.slice(0, counts.continued)], [field, counts.continued]);
  const changedCells = useMemo(() => cells.slice(0, field.cells.length + counts.changed), [cells, field, counts.changed]);
  const channels = useMemo(() => tissueChannels(cancer, scenarios, shown), [cancer, scenarios, shown]);
  const selected = focus?.cancer === cancer ? cells[focus.id] : undefined;
  const anatomy = TISSUE_ARCHITECTURES[cancer];
  const inspect = (cell: TissueCell) => setFocus({ cancer, id: cell.id });
  const term = selected?.role === "clone" ? "illustrative cluster cell" : selected?.role === "support"
    ? "connective tissue cell" : selected?.role === "pigment" ? "melanocyte" : anatomy.cell;
  function stepFocus(direction: number) {
    const origin = selected?.id ?? field.cells.length - 1;
    inspect(cells[(origin + direction + cells.length) % cells.length]);
  }
  function appliedMarks(list: TissueChannel[], present: boolean) {
    if (!present) return "cell absent from this field";
    if (!selected || selected.role === "support") return "none";
    return list.filter(channel => markStrength(selected, channel) > .025).map(channel => channel.label).join(", ") || "none";
  }

  return <section className="cl-live-layout">
    <div className="cl-live cl-live-stage">
    <div className="cl-live-heading"><h2>Live tissue model</h2><span>Synthetic tissue</span></div>
    <p className="cl-live-anatomy"><strong>{anatomy.name}.</strong> {anatomy.description} <a href={anatomy.source}>Anatomy source</a></p>
    <p className="cl-live-reading">Colored marks show exposure history. The chosen example course determines the size of the dark cluster.</p>
    <div className="cl-live-fields">
      <TissuePane label="Continue" field={field} cells={cells} count={counts.continued} channels={channels.continued} zoom={zoom} selected={selected} selectedFactor={selectedFactor} inheritedLabel={inheritedFinding?.label} onInspect={inspect}/>
      <TissuePane label="Change" field={field} cells={changedCells} count={counts.changed} channels={channels.changed} zoom={zoom} selected={selected} selectedFactor={selectedFactor} inheritedLabel={inheritedFinding?.label} onInspect={inspect}/>
    </div>
    {inheritedFinding && <p className="cl-live-gene"><strong>{inheritedFinding.label}.</strong> The nucleus label represents the shared inherited background. Exposure values and cluster counts stay independent of this finding.
      {inheritedFinding.mechanism && <> The associated process is <em>{inheritedFinding.mechanism}</em>.</>}</p>}
    <div className="cl-live-time">
      <RangeControl label="Tissue time" unit="years from today" min={0} max={limit} step={.25} value={shown}
        onChange={value => { setPlaying(false); changeYear(value); }}/>
      <button type="button" className="cl-live-action" disabled={limit === 0} aria-pressed={playing}
        onClick={() => { if (!playing && shown >= limit) changeYear(0); setPlaying(!playing); }}>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
    </div>
    {settings}
    <div className="cl-live cl-live-details">
    <div className="cl-live-tools">
      <div role="group" aria-label="Illustrative cluster expansion" className="cl-presets">
        <span>Cluster expansion</span>
        {paces.map(([id, label]) => <button type="button" key={id} aria-pressed={pace === id} onClick={() => setPace(id)}>{label}</button>)}
      </div>
      <button type="button" aria-pressed={zoom} className="cl-live-action" onClick={() => setZoom(!zoom)}>2× detail</button>
    </div>
    <div role="group" aria-label="Assumed course after change" className="cl-live-course cl-presets">
      <span>Assumed course after change</span>
      {courses.map(([id,label]) => <button key={id} type="button" aria-pressed={course === id} onClick={() => setCourse(id)}>{label}</button>)}
    </div>
    <p className="cl-live-help">{forkYear === null ? "Both fields follow the same pace while all rates match." :
      `You choose the example course after the first rate change at year ${format(forkYear, 2)}. The exposure values cannot predict this course.`}</p>
    <div className="cl-live-key">
      <span className="cl-live-normal"><i aria-hidden="true"/>Tissue cell</span>
      <span className="cl-live-clone"><i aria-hidden="true"/>Illustrative cluster</span>
    </div>
    <p className="cl-live-help">Each mark records one factor. The marks do not measure cell damage, cancer risk, or growth.</p>
    {channels.continued.length > 0 && <table className="cl-live-channels">
      <caption>Factor marks at year {format(shown, 2)}</caption>
      <thead><tr><th scope="col">Factor</th><th scope="col">Continue</th><th scope="col">Change</th></tr></thead>
      <tbody>{channels.continued.map((channel, i) => <tr key={channel.factor}>
        <th scope="row"><div><ChannelSymbol {...channel}/><span>{channel.label}</span></div></th>
        {[channel, channels.changed[i]].map((side, n) => <td key={n}>{format(side.rate, 6)} {side.unit}<small>{format(side.total, 3)} {side.totalUnit}</small></td>)}
      </tr>)}</tbody>
    </table>}
    {!channels.continued.length && <p className="cl-live-help">Enable a factor to add its marks to the two fields.</p>}
    <div className="cl-live-inspect">
      <div role="group" aria-label="Inspect a model cell" className="cl-presets">
        <span>Inspect a cell</span><button type="button" onClick={() => stepFocus(-1)}>Previous cell</button>
        <button type="button" onClick={() => stepFocus(1)}>Next cell</button>
      </div>
      <p aria-live="polite">{selected ? <>Cell {selected.id + 1}, {term}. Continue marks: {appliedMarks(channels.continued, true)}. Change marks: {appliedMarks(channels.changed, !!changedCells[selected.id])}.</>
        : "Select a cell in either field, or use the buttons to inspect the same cell in both."}</p>
    </div>
    </div>
  </section>;
}
