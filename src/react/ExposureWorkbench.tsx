import { useId, useState } from "react";
import {
  CANCER_TYPES, FACTORS, projectExposure, YEAR_LIMITS, comparePlan, GENETIC_PROFILES,
  type CancerId, type FactorId, type ExposureFactor, type ExposureScenario, type ContextSelection, medicalHistoryNotes
} from "../core/index.js";
import { RangeControl, format } from "./controls.js";
import { BodyMassInput } from "./BodyMassInput.js";
import { ExposureChart } from "./ExposureChart.js";
import { CombinationEvidence } from "./CombinationEvidence.js";
import { LiveTissue } from "./LiveTissue.js";
import { TissueFigure } from "./TissueFigure.js";

type Settings = Pick<ExposureScenario, "initialRate" | "changedRate" | "historyYears" | "changeYear">;
interface Plan {
  factor: FactorId;
  settings: Partial<Record<FactorId, Settings>>;
  excluded: FactorId[];
  horizonYears: number;
  year: number;
}
function defaultPlan(factor: FactorId): Plan {
  return { factor, settings: {}, excluded: [], horizonYears: 20, year: 10 };
}
function rateAction(factor: ExposureFactor) {
  if (factor.id === "sunburns") return "Set zero burns";
  if (factor.changedRate === 0) return "Stop now";
  return "Set " + factor.changedRate + " " + factor.unit + " now";
}

export function ExposureWorkbench({ cancer, active, context, showContext, showMeasurements }: {
  cancer: CancerId; active: boolean; context: ContextSelection; showContext: () => void; showMeasurements: () => void;
}) {
  const [plans, setPlans] = useState<Partial<Record<CancerId, Plan>>>({});
  const evidenceId = useId();
  const site = CANCER_TYPES.find(entry => entry.id === cancer)!;
  const plan = plans[cancer] ?? defaultPlan(site.factors[0]);
  const factor = FACTORS[plan.factor];
  const included = site.factors.filter(id => !plan.excluded.includes(id));
  function settingsFor(id: FactorId): Settings {
    const { initialRate, changedRate } = FACTORS[id];
    return plan.settings[id] ?? { initialRate, changedRate, historyYears: 20, changeYear: 0 };
  }
  function scenarioFor(id: FactorId): ExposureScenario {
    return { ...settingsFor(id), cancer, factor: id, horizonYears: plan.horizonYears };
  }
  const scenario = scenarioFor(plan.factor);
  const scenarios = included.map(scenarioFor);
  const result = projectExposure(scenario);
  const comparison = comparePlan(scenarios, plan.year);
  const { milestone } = result;
  const yearsSinceChange = plan.horizonYears - scenario.changeYear;
  const window = milestone?.window;
  const timing = window && (yearsSinceChange < window[0] ? "before" : yearsSinceChange > window[1] ? "after" : "within");
  const selectedProfile = GENETIC_PROFILES[cancer].find(p => p.id === context.geneticProfile);
  const familyText = {unknown:"Family history unknown", "first-degree":"Affected first-degree relative", "none-reported":"No affected relative reported"}[context.familyHistory];
  const stressText = context.stressScore === null ? "Stress score unreported" : context.nextStressScore == null
    ? "PSS-10 " + context.stressScore + "/40" : "PSS-10 " + context.stressScore + " to " + context.nextStressScore + "/40";
  function update(values: Partial<Plan>) {
    setPlans(previous => ({ ...previous, [cancer]: { ...(previous[cancer] ?? defaultPlan(site.factors[0])), ...values } }));
  }
  function setFactor(id: FactorId, changes: Partial<Settings>) {
    setPlans(previous => {
      const current = previous[cancer] ?? defaultPlan(site.factors[0]);
      const settings = { ...current.settings, [id]: { ...(current.settings[id] ?? settingsFor(id)), ...changes } };
      return { ...previous, [cancer]: { ...current, factor: id, settings } };
    });
  }
  function schedule(kind: "keep" | "together" | "stagger") {
    const settings = { ...plan.settings };
    included.forEach((id, index) => {
      const values = settingsFor(id);
      settings[id] = { ...values, changedRate: kind === "keep" ? values.initialRate : FACTORS[id].changedRate,
        changeYear: kind === "stagger" ? 5 * index : 0 };
    });
    update({ settings });
  }
  const isIncluded = included.includes(plan.factor);
  const hasPhoto = ["lung","oral","colorectal","breast"].includes(cancer);
  return <>
    <LiveTissue key={cancer} active={active} cancer={cancer} selectedFactor={isIncluded ? plan.factor : undefined}
      inheritedFinding={selectedProfile} scenarios={scenarios} year={plan.year} horizonYears={plan.horizonYears} onYearChange={year => update({ year })}
      settings={<section className="cl-config">
        <div className="cl-config-heading"><h2>Exposure settings</h2>
          <button type="button" className="cl-text-button" onClick={showContext}>Edit genetics &amp; stress</button>
        </div>
        <p className="cl-factor-intro">The tissue uses the checked factors together. Select a name for timing and evidence.</p>
        <div role="group" aria-label={site.label + " exposure factors"}>
          <div className="cl-factor-head" aria-hidden="true"><span>Factor</span><span>Current</span><span>Planned</span></div>
          {site.factors.map(id => {
            const entry = FACTORS[id];
            const rates = settingsFor(id);
            const checked = included.includes(id);
            return <div className="cl-factor-row" role="group" aria-label={entry.label} key={id}>
              <div className="cl-factor-name">
                <label className="cl-include"><input type="checkbox" checked={checked}
                  aria-label={`Include ${entry.label.toLowerCase()} in the tissue comparison`}
                  onChange={() => update({ excluded: checked ? [...plan.excluded, id] : plan.excluded.filter(value => value !== id) })}/></label>
                <button type="button" className="cl-factor-details" aria-label={"Details for " + entry.label} aria-pressed={plan.factor === id}
                  onClick={() => update({ factor: id })}><strong>{entry.label}</strong><small>{entry.unit}</small></button>
              </div>
              <RangeControl exact compact label={entry.label + " current rate"} unit={entry.unit} value={rates.initialRate}
                min={entry.min} max={entry.max} step={entry.step} onChange={initialRate => setFactor(id, { initialRate })}/>
              <RangeControl exact compact label={entry.label + " planned rate"} unit={entry.unit} value={rates.changedRate}
                min={entry.min} max={entry.max} step={entry.step} onChange={changedRate => setFactor(id, { changedRate })}/>
            </div>;
          })}
        </div>
        <section className="cl-factor-timing" aria-label={"Timing for " + factor.label}>
          <div className="cl-factor-title"><h3>{factor.label}</h3><a href={"#" + evidenceId}>History &amp; evidence</a></div>
          <p>{factor.description}</p>
          <div className="cl-presets">
            <button type="button" aria-pressed={scenario.changedRate === scenario.initialRate} onClick={() => setFactor(plan.factor, { changedRate: scenario.initialRate })}>Keep rate</button>
            <button type="button" aria-pressed={scenario.changedRate === factor.changedRate && scenario.changeYear === 0}
              onClick={() => setFactor(plan.factor, { changedRate: factor.changedRate, changeYear: 0 })}>{rateAction(factor)}</button>
          </div>
          {plan.factor === "bmi" && <BodyMassInput apply={(value, which) => setFactor(plan.factor, {[which]:value})}/>}
          <div className="cl-config-time">
            <RangeControl label="Prior exposure" unit="years" value={scenario.historyYears} min={0} max={YEAR_LIMITS.historyYears} onChange={historyYears => setFactor(plan.factor, { historyYears })}/>
            <RangeControl label="Delay until change" unit="years" value={scenario.changeYear} min={0} max={YEAR_LIMITS.changeYear} onChange={changeYear => setFactor(plan.factor, { changeYear })}/>
          </div>
        </section>
        <div className="cl-plan-horizon"><RangeControl label="Years from today" unit="years" value={plan.horizonYears} min={1} max={YEAR_LIMITS.horizonYears}
          onChange={horizonYears => update({ horizonYears, year: Math.min(plan.year, horizonYears) })}/></div>
      </section>}/>
    <section className="cl-plan-strip">
      <h2>Combine changes</h2>
      <p>Choose a schedule for the included factors. You can then adjust each rate and start year separately.</p>
      <div className="cl-presets" role="group" aria-label="Combination schedules">
        <button type="button" disabled={!included.length} onClick={() => schedule("keep")}>Keep all current rates</button>
        <button type="button" disabled={!included.length} onClick={() => schedule("together")}>Change all today</button>
        <button type="button" disabled={included.length < 2} onClick={() => schedule("stagger")}>Stagger by 5 years</button>
      </div>
      {included.length ? <>
        <table className="cl-table cl-plan-table"><caption>Change schedule through year {plan.horizonYears}</caption>
          <thead><tr><th>Included factor</th><th>Starts</th><th>Change schedule</th><th>Years at new rate by year {format(plan.year)}</th></tr></thead>
          <tbody>{comparison.rows.map(row => {
            const kept = settingsFor(row.factor).initialRate === settingsFor(row.factor).changedRate;
            const start = Math.min(100, 100 * row.changeYear / plan.horizonYears);
            return <tr key={row.factor}>
              <th scope="row">{FACTORS[row.factor].label}<small>{format(settingsFor(row.factor).initialRate, 6)} to {format(settingsFor(row.factor).changedRate, 6)} {FACTORS[row.factor].unit}</small></th>
              <td>{kept ? "Keep rate" : row.changeYear ? "Year " + row.changeYear : "Today"}</td>
              <td><div className="cl-schedule-bar" aria-hidden="true">
                {!kept && <i style={{left:start + "%"}}/>}<b style={{left:100 * plan.year / plan.horizonYears + "%"}}/>
              </div></td>
              <td>{format(row.yearsAtNewRate,2)}</td>
            </tr>;
          })}</tbody>
        </table>
        <p className="cl-chart-caption">The shaded segment starts at each change. The vertical mark shows the inspection year.</p>
        {comparison.scheduledChanges >= 2 && <p className="cl-joint-years">By year {format(plan.year)}, all {comparison.scheduledChanges} scheduled changes have been in effect together for <b>{format(comparison.allChangesOverlapYears)} years</b>.</p>}
      </> : <p className="cl-note">The tissue currently shows its background anatomy. Include a factor to compare its histories.</p>}
      <button type="button" className="cl-text-button" onClick={() => update(defaultPlan(site.factors[0]))}>Reset {site.label.toLowerCase()} scenario</button>
    </section>
    <div className="cl-context-strip">
      <div><h3>Shared background</h3><p>{[selectedProfile?.label ?? "Inherited finding unspecified", familyText, stressText,
        ...medicalHistoryNotes(context).map(note => note.headline)].join(" · ")}</p></div>
    </div>
    <section className="cl-investigation" id={evidenceId} tabIndex={-1}>
      <h2>Exposure history</h2>
      <div className="cl-lower">
        <div><h3>{factor.label}</h3>
          {!isIncluded && <p>This factor is outside the combined plan. Its individual history appears here for inspection.</p>}
          <ExposureChart result={result} scenario={scenario} factor={factor} inspectedYear={plan.year}/>
          {milestone && <section className="cl-interpret"><h3>{milestone.label}</h3><p>{milestone.detail}</p>
            {timing && <p>At year {plan.horizonYears}, the plan is {timing} this window.</p>}<a href={milestone.source.url}>{milestone.source.label}</a></section>}
        </div>
        <section className="cl-evidence"><h3>What the studies found</h3>
          {result.evidence.map(note => <article key={note.headline}><h4>{note.headline}</h4><p>{note.detail}</p><a href={note.source.url}>{note.source.label}</a></article>)}
        </section>
      </div>
    </section>
    <div className="cl-reference-row">
      <CombinationEvidence cancer={cancer} factors={included}/>
      {hasPhoto && <section className="cl-photo-reference"><h3>Compare with a real specimen</h3><TissueFigure key={cancer} cancer={cancer}/></section>}
    </div>
    <div className="cl-crosslink"><p><strong>Did an existing tumor slow down?</strong> Compare the rates from three scans and examine the evidence after diagnosis.</p>
      <button type="button" className="cl-action" onClick={showMeasurements}>Compare tumor measurements</button>
    </div>
  </>;
}
