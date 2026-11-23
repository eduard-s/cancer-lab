import { projectExposure, YEAR_LIMITS, type ExposureScenario, type FactorId } from "./exposure.js";

export interface PlanRow {
  factor: FactorId;
  currentRate: number;
  planRate: number;
  changeYear: number;
  continuedTotal: number;
  changedTotal: number;
  yearsAtNewRate: number;
  changeHasStarted: boolean;
}

/** Summarize independent factor histories on one common clock. */
export function comparePlan(scenarios: readonly ExposureScenario[], year: number) {
  if (!Number.isFinite(year) || year < 0 || year > YEAR_LIMITS.horizonYears) {
    throw new RangeError("The inspection year is outside the model limits.");
  }
  const first = scenarios[0];
  const seen = new Set<FactorId>();
  const rows: PlanRow[] = scenarios.map(scenario => {
    if (seen.has(scenario.factor) || scenario.cancer !== first.cancer || scenario.horizonYears !== first.horizonYears) {
      throw new RangeError("Use one cancer type, one end year, and one history for each factor.");
    }
    if (!Number.isFinite(scenario.horizonYears) || scenario.horizonYears > YEAR_LIMITS.horizonYears || year > scenario.horizonYears) {
      throw new RangeError("The inspection year must be within the plan.");
    }
    seen.add(scenario.factor);
    const projection = projectExposure({ ...scenario, horizonYears: year });
    const hasNewRate = scenario.initialRate !== scenario.changedRate;
    const changeHasStarted = hasNewRate && year >= scenario.changeYear;
    return {
      factor: scenario.factor,
      currentRate: scenario.initialRate,
      planRate: changeHasStarted ? scenario.changedRate : scenario.initialRate,
      continuedTotal: projection.continuedTotal,
      changedTotal: projection.changedTotal,
      changeYear: scenario.changeYear,
      changeHasStarted,
      yearsAtNewRate: changeHasStarted ? year - scenario.changeYear : 0
    };
  });
  const scheduled = scenarios.filter(scenario => scenario.initialRate !== scenario.changedRate);
  const allChangesOverlapYears = scheduled.length
    ? Math.max(0, year - Math.max(...scheduled.map(scenario => scenario.changeYear))) : 0;
  return { year, rows, scheduledChanges: scheduled.length, allChangesOverlapYears };
}
