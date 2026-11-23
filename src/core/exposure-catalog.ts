export type CancerId = "lung" | "oral" | "colorectal" | "breast" | "melanoma" | "liver" | "prostate" | "pancreatic";
export type FactorId = "smoking" | "radon" | "alcohol" | "processed-meat" | "activity" | "pm25" | "areca" | "bmi"
  | "sunburns" | "indoor-tanning" | "vitamin-e" | "secondhand-smoke" | "silica" | "diesel-exhaust"
  | "smokeless-tobacco" | "dietary-fiber" | "leisure-sitting" | "sunscreen" | "coffee" | "selenium";

export interface CancerType {
  id: CancerId;
  label: string;
  factors: readonly FactorId[];
}

export const CANCER_TYPES: readonly CancerType[] = [
  { id: "lung", label: "Lung", factors: ["smoking", "radon", "pm25", "secondhand-smoke", "silica", "diesel-exhaust"] },
  { id: "oral", label: "Oral cavity", factors: ["smoking", "alcohol", "areca", "smokeless-tobacco"] },
  { id: "colorectal", label: "Colorectal", factors: ["processed-meat", "alcohol", "activity", "smoking", "bmi", "dietary-fiber"] },
  { id: "breast", label: "Breast", factors: ["alcohol", "activity", "bmi", "leisure-sitting"] },
  { id: "melanoma", label: "Melanoma", factors: ["sunburns", "indoor-tanning", "sunscreen"] },
  { id: "liver", label: "Liver", factors: ["alcohol", "smoking", "bmi", "activity", "coffee"] },
  { id: "prostate", label: "Prostate", factors: ["bmi", "vitamin-e", "selenium"] },
  { id: "pancreatic", label: "Pancreatic", factors: ["smoking", "bmi", "smokeless-tobacco"] },
];

export interface ExposureFactor {
  id: FactorId;
  label: string;
  unit: string;
  totalUnit: string;
  min: number;
  max: number;
  step: number;
  initialRate: number;
  changedRate: number;
  description: string;
  /** Unit conversion after the optional threshold converts a measurement to 0 or 1. */
  totalPerRateYear: number;
  /** For duration totals, one year counts only at or above this measurement. */
  durationThreshold?: number;
}

// Calendar conversion for the modeled period, independent of cancer type.
const daysPerYear = 365.25;
export const FACTORS: Readonly<Record<FactorId, ExposureFactor>> = {
  smoking: {
    id: "smoking", label: "Cigarette smoking", unit: "cigarettes/day", totalUnit: "pack-years",
    min: 0, max: 60, step: 1, initialRate: 20, changedRate: 0,
    description: "Average cigarettes smoked each day. Twenty a day for one year adds one pack-year.",
    totalPerRateYear: 1 / 20,
  },
  radon: {
    id: "radon", label: "Indoor radon", unit: "Bq/m³", totalUnit: "Bq·years/m³",
    min: 5, max: 600, step: 5, initialRate: 200, changedRate: 40,
    description: "Long-term average concentration in the home. One becquerel is one radioactive decay per second. Mitigation can lower indoor levels.",
    totalPerRateYear: 1,
  },
  alcohol: {
    id: "alcohol", label: "Alcohol", unit: "g ethanol/day", totalUnit: "kg ethanol",
    min: 0, max: 84, step: 1, initialRate: 14, changedRate: 0,
    description: "Average grams of pure alcohol each day. One US standard drink contains about 14 g of ethanol.",
    totalPerRateYear: daysPerYear / 1000,
  },
  "processed-meat": {
    id: "processed-meat", label: "Processed meat", unit: "g/day", totalUnit: "kg",
    min: 0, max: 150, step: 5, initialRate: 50, changedRate: 0,
    description: "Average daily weight of meat preserved by curing, salting, smoking or similar methods. Examples include bacon and ham.",
    totalPerRateYear: daysPerYear / 1000,
  },
  activity: {
    id: "activity", label: "Physical activity", unit: "min/week", totalUnit: "hours",
    min: 0, max: 600, step: 5, initialRate: 30, changedRate: 150,
    description: "Minutes of moderate-intensity leisure activity each week, such as brisk walking. The chart adds up time spent active.",
    totalPerRateYear: daysPerYear / 7 / 60,
  },
  pm25: {
    id: "pm25", label: "Outdoor fine particles", unit: "µg/m³", totalUnit: "µg·years/m³",
    min: 1, max: 100, step: 1, initialRate: 20, changedRate: 5,
    description: "Annual average concentration of outdoor PM₂.₅. The chart adds concentration over time. Personal inhaled dose also depends on where you spend time.",
    totalPerRateYear: 1,
  },
  areca: {
    id: "areca", label: "Areca nut", unit: "chews/day", totalUnit: "chewing episodes",
    min: 0, max: 20, step: 1, initialRate: 4, changedRate: 0,
    description: "Average times per day a person chews areca nut, alone or in betel quid. Each use counts as one episode.",
    totalPerRateYear: daysPerYear,
  },
  sunburns: {
    id: "sunburns", label: "Blistering sunburns", unit: "burns/year", totalUnit: "sunburns",
    min: 0, max: 6, step: 0.25, initialRate: 1, changedRate: 0,
    description: "Average number of severe, blistering sunburns per year. One burn every four years corresponds to 0.25 burns/year.",
    totalPerRateYear: 1,
  },
  "indoor-tanning": {
    id: "indoor-tanning", label: "Indoor UV tanning", unit: "sessions/year", totalUnit: "sessions",
    min: 0, max: 100, step: 1, initialRate: 12, changedRate: 0,
    description: "Average sessions per year in a UV tanning bed or booth. Spray tanning does not use UV light.",
    totalPerRateYear: 1,
  },
  bmi: {
    id: "bmi", label: "Adult body mass index", unit: "kg/m²", totalUnit: "years at BMI ≥30",
    min: 16, max: 55, step: 0.5, initialRate: 32, changedRate: 28,
    description: "BMI equals weight in kilograms divided by squared height in meters. The chart counts adult years at BMI 30 or higher.",
    durationThreshold: 30, totalPerRateYear: 1,
  },
  "vitamin-e": {
    id: "vitamin-e", label: "Vitamin E supplements", unit: "IU/day", totalUnit: "IU",
    min: 0, max: 400, step: 10, initialRate: 400, changedRate: 0,
    description: "Daily international units of supplemental synthetic alpha-tocopherol. This input excludes vitamin E in food.",
    totalPerRateYear: daysPerYear,
  },
  "secondhand-smoke": {
    id: "secondhand-smoke", label: "Secondhand smoke", unit: "h/week", totalUnit: "hours",
    min: 0, max: 168, step: 1, initialRate: 20, changedRate: 0,
    description: "Average hours per week in the presence of smoke from other people's tobacco. The total records time. Smoke concentration can vary.",
    totalPerRateYear: daysPerYear / 7,
  },
  silica: {
    id: "silica", label: "Workplace silica dust", unit: "µg/m³", totalUnit: "µg·years/m³",
    min: 0, max: 500, step: 5, initialRate: 100, changedRate: 25,
    description: "Average airborne concentration of respirable crystalline silica over an 8-hour workday. Use the average across workdays, including days without exposure.",
    totalPerRateYear: 1,
  },
  "diesel-exhaust": {
    id: "diesel-exhaust", label: "Workplace diesel exhaust", unit: "µg EC/m³", totalUnit: "µg EC·years/m³",
    min: 0, max: 300, step: 1, initialRate: 50, changedRate: 10,
    description: "Average work-shift concentration of respirable elemental carbon (EC), a marker for diesel exhaust. This input uses measurements from the workplace.",
    totalPerRateYear: 1,
  },
  "smokeless-tobacco": {
    id: "smokeless-tobacco", label: "Smokeless tobacco", unit: "uses/day", totalUnit: "uses",
    min: 0, max: 30, step: 1, initialRate: 5, changedRate: 0,
    description: "Average daily uses of chewing tobacco, oral snuff, or another oral product that contains tobacco. Count each use once, regardless of portion size.",
    totalPerRateYear: daysPerYear,
  },
  "dietary-fiber": {
    id: "dietary-fiber", label: "Dietary fiber", unit: "g/day", totalUnit: "kg of fiber",
    min: 0, max: 60, step: 1, initialRate: 15, changedRate: 25,
    description: "Average grams of fiber from food each day. Sources include whole grains, beans, vegetables, and fruit. Exclude fiber supplements.",
    totalPerRateYear: daysPerYear / 1000,
  },
  "leisure-sitting": {
    id: "leisure-sitting", label: "Leisure sitting time", unit: "h/day", totalUnit: "hours seated",
    min: 0, max: 16, step: 0.5, initialRate: 6, changedRate: 2,
    description: "Average waking hours spent seated outside work each day. Report leisure sitting and physical activity separately.",
    totalPerRateYear: daysPerYear,
  },
  sunscreen: {
    id: "sunscreen", label: "Sunscreen use", unit: "days/week", totalUnit: "days of use",
    min: 0, max: 7, step: 1, initialRate: 2, changedRate: 7,
    description: "Average days per week with sunscreen on exposed skin. Count each day once. The chart records frequency, regardless of coverage or reapplication.",
    totalPerRateYear: daysPerYear / 7,
  },
  coffee: {
    id: "coffee", label: "Coffee intake", unit: "cups/day", totalUnit: "cups",
    min: 0, max: 8, step: 0.5, initialRate: 2, changedRate: 1,
    description: "Average cups of coffee per day. Use the same cup size in both plans. The chart counts servings, and caffeine content varies.",
    totalPerRateYear: daysPerYear,
  },
  selenium: {
    id: "selenium", label: "Selenium supplements", unit: "µg/day", totalUnit: "mg of selenium",
    min: 0, max: 200, step: 5, initialRate: 200, changedRate: 0,
    description: "Average daily micrograms of selenium from supplements. Exclude selenium in food. The chart gives the cumulative amount in milligrams.",
    totalPerRateYear: daysPerYear / 1000,
  },
};

export const YEAR_LIMITS = { historyYears: 80, changeYear: 50, horizonYears: 50 } as const;

export interface ExposureScenario {
  cancer: CancerId;
  factor: FactorId;
  initialRate: number;
  changedRate: number;
  historyYears: number;
  /** Years from today until switching to changedRate. */
  changeYear: number;
  /** Years from today to the end of observation, including a possible delay. */
  horizonYears: number;
}

export interface EvidenceSource {
  label: string;
  url: string;
}

export interface EvidenceNote {
  headline: string;
  detail: string;
  source: EvidenceSource;
}

export interface ExposureMilestone {
  label: string;
  detail: string;
  source: EvidenceSource;
  /** Years since complete cessation, when a source identifies a time window. */
  window?: readonly [number, number];
}
