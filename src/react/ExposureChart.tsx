import type { ExposureFactor, ExposureProjection, ExposureScenario } from "../core/index.js";
import { format } from "./controls.js";

function tickText(value: number, digits: number) {
  return value >= 10000 ? format(value / 1000) + "k" : format(value, digits);
}

export function ExposureChart({ result, scenario, factor, inspectedYear }: {
  result: ExposureProjection; scenario: ExposureScenario; factor: ExposureFactor; inspectedYear: number;
}) {
  const { historyYears, horizonYears, changeYear } = scenario;
  const totalYears = historyYears + horizonYears;
  const top = Math.max(result.continuedTotal, result.changedTotal) || 1;
  const digits = Math.max(1, factor.step.toString().split(".")[1]?.length ?? 0);
  const x = (year: number) => 100 * (historyYears + year) / totalYears;
  const y = (value: number) => 100 * (1 - value / top);
  const series = (key: "continued" | "changed") =>
    result.points.map(p => x(p.year) + "," + y(p[key]));
  const first = x(0);
  const showNow = first > 15 && first < 85;
  const showChange = changeYear > 0 && changeYear < horizonYears && scenario.initialRate !== scenario.changedRate;
  return <figure className="cl-plot">
    <figcaption>
      <h3>{factor.id === "bmi" ? "Time at BMI 30 or higher" : factor.id === "activity" ? "Total activity" : "Cumulative exposure"}</h3>
      <span>{factor.totalUnit}</span>
    </figcaption>
    <div className="cl-graph-body">
      <div className="cl-y-ticks" aria-hidden="true">{[top, top / 2, 0].map((v, i) => <span key={i}>{tickText(v, digits)}</span>)}</div>
      <div className="cl-plot-area">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect className="cl-past" width={first} height="100"/>
          {[0,25,50,75,100].map(tick => <line className="cl-grid-line" key={tick} x1="0" x2="100" y1={tick} y2={tick} />)}
          <polygon className="cl-between" points={[...series("continued"), ...series("changed").reverse()].join(" ")} />
          {historyYears > 0 && <line className="cl-line cl-history" x1="0" x2={first} y1="100" y2={y(result.historyTotal)}/>}
          <line className="cl-marker" x1={first} x2={first} y1="0" y2="100"/>
          {showChange && <line className="cl-marker cl-change-marker" x1={x(changeYear)} x2={x(changeYear)} y1="0" y2="100"/>}
          <line className="cl-inspection-marker" x1={x(inspectedYear)} x2={x(inspectedYear)} y1="0" y2="100"/>
          <polyline className="cl-line cl-changed" points={series("changed").join(" ")}/>
          <polyline className="cl-line cl-continued" points={series("continued").join(" ")}/>
        </svg>
        <div className="cl-x-ticks" aria-hidden="true">
          <span>{historyYears === 0 ? "Today" : historyYears + " y ago"}</span>
          {showNow && <span style={{ left: first + "%" }}>Today</span>}
          <span>Year {horizonYears}</span>
        </div>
      </div>
    </div>
    <ul className="cl-plot-key" aria-label="Totals">
      <li><i className="cl-swatch cl-swatch-past" aria-hidden="true"/>Today <b>{format(result.historyTotal, digits)}</b></li>
      <li><i className="cl-swatch cl-swatch-continued" aria-hidden="true"/>Continue <b>{format(result.continuedTotal, digits)}</b></li>
      <li><i className="cl-swatch cl-swatch-changed" aria-hidden="true"/>Change <b>{format(result.changedTotal, digits)}</b></li>
      <li><i className="cl-swatch cl-swatch-year" aria-hidden="true"/>Tissue year {format(inspectedYear)}</li>
    </ul>
    <p className="cl-chart-caption">At year {horizonYears}, {result.changedTotal === result.continuedTotal ? "both paths reach the same total." :
      "the changed plan includes " + format(Math.abs(result.changedTotal - result.continuedTotal), Math.max(2, digits)) + " " + factor.totalUnit +
      (result.changedTotal < result.continuedTotal ? " less." : " more.")} {changeYear === 0
      ? "The new rate starts today." : changeYear > horizonYears ? "The change starts after the chart ends." : "The new rate starts in year " + changeYear + "."}</p>
  </figure>;
}
