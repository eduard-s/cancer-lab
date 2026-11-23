import {
  CANCER_TYPES, FACTORS, YEAR_LIMITS,
  type EvidenceNote, type ExposureMilestone, type ExposureScenario,
} from "./exposure-catalog.js";
import { getEvidence, getMilestone } from "./exposure-evidence.js";

export * from "./exposure-catalog.js";

export interface ExposurePoint {
  year: number;
  continued: number;
  changed: number;
}

export interface ExposureProjection {
  points: ExposurePoint[];
  continuedTotal: number;
  changedTotal: number;
  historyTotal: number;
  evidence: EvidenceNote[];
  milestone: ExposureMilestone | null;
}

function checkRange(name: string, value: number, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be a finite number between ${min} and ${max}.`);
  }
}

/** Compare two intake, activity or environmental exposure histories in the factor's units. */
export function projectExposure(scenario: ExposureScenario): ExposureProjection {
  const { cancer, factor, initialRate, changedRate, historyYears, changeYear, horizonYears } = scenario;
  const cancerType = CANCER_TYPES.find(type => type.id === cancer);
  if (!cancerType?.factors.includes(factor)) {
    throw new RangeError(`Unsupported cancer and factor combination: ${cancer}, ${factor}.`);
  }
  const { min, max, totalPerRateYear, durationThreshold } = FACTORS[factor];
  checkRange("initialRate", initialRate, min, max);
  checkRange("changedRate", changedRate, min, max);
  checkRange("historyYears", historyYears, 0, YEAR_LIMITS.historyYears);
  checkRange("changeYear", changeYear, 0, YEAR_LIMITS.changeYear);
  checkRange("horizonYears", horizonYears, 0, YEAR_LIMITS.horizonYears);

  function annualTotal(rate: number) {
    if (durationThreshold !== undefined) return Number(rate >= durationThreshold);
    return rate * totalPerRateYear;
  }
  const initialAnnualTotal = annualTotal(initialRate);
  const changedAnnualTotal = annualTotal(changedRate);
  const historyTotal = historyYears * initialAnnualTotal;
  const years = new Set([0, Math.min(changeYear, horizonYears), horizonYears]);
  for (let year = 1; year < horizonYears; year++) years.add(year);
  const points = Array.from(years).sort((a, b) => a - b).map(year => {
    const continued = historyTotal + year * initialAnnualTotal;
    const yearsAtChangedRate = Math.max(0, year - changeYear);
    const changed = yearsAtChangedRate === 0 || initialRate === changedRate ? continued :
      historyTotal + initialAnnualTotal * changeYear + changedAnnualTotal * yearsAtChangedRate;
    return { year, continued, changed };
  });
  const last = points[points.length - 1]!;
  return {
    points,
    continuedTotal: last.continued,
    changedTotal: last.changed,
    historyTotal,
    evidence: getEvidence(scenario),
    milestone: getMilestone(scenario),
  };
}
