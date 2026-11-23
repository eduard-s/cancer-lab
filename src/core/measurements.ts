export interface Scan {
  /** Days from the first example scan. */
  day: number;
  /** Volume of the same lesion, in cubic centimeters. */
  volumeCm3: number;
}

export const VOLUME_METHOD = {
  label: "Wilson et al., American Journal of Respiratory and Critical Care Medicine",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3262038/"
};

export function measureInterval(first: Scan, last: Scan) {
  for (const scan of [first, last]) {
    if (!Number.isFinite(scan.day) || scan.day < 0 || !Number.isFinite(scan.volumeCm3) || scan.volumeCm3 <= 0) {
      throw new RangeError("Each scan needs a nonnegative day and a positive finite volume.");
    }
  }
  const days = last.day - first.day;
  if (days <= 0) throw new RangeError("Scan days must increase.");
  const logRatio = Math.log(last.volumeCm3) - Math.log(first.volumeCm3);
  const logRatePerDay = logRatio / days;
  return {
    days,
    percentChange: 100 * Math.expm1(logRatio),
    logRatePerDay,
    doublingDays: logRatePerDay > 0 ? Math.LN2 / logRatePerDay : null,
    halvingDays: logRatePerDay < 0 ? -Math.LN2 / logRatePerDay : null
  };
}

export function compareScans(first: Scan, middle: Scan, last: Scan) {
  const earlier = measureInterval(first, middle);
  const later = measureInterval(middle, last);
  const diff = later.logRatePerDay - earlier.logRatePerDay;
  const tolerance = 1e-12 * Math.max(Math.abs(earlier.logRatePerDay), Math.abs(later.logRatePerDay));
  const trend = Math.abs(diff) <= tolerance ? "same" : diff < 0 ? "lower" : "higher";
  return { earlier, later, trend } as const;
}

/** Apply both measured log-rates to 1 cm³ for the same number of observed days. */
export function compareFromOneCm3(scans: ReturnType<typeof compareScans>, days: number) {
  const maxDays = Math.min(scans.earlier.days, scans.later.days);
  if (!Number.isFinite(maxDays) || maxDays <= 0 || !Number.isFinite(days) || days < 0 || days > maxDays) {
    throw new RangeError("Choose a duration from zero to the shorter scan interval.");
  }
  function volumeAt(rate: number) {
    const volume = Math.exp(rate * days);
    if (!Number.isFinite(volume) || volume <= 0) throw new RangeError("The volume ratio exceeds the numeric range.");
    return volume;
  }
  return { days, maxDays, earlierCm3: volumeAt(scans.earlier.logRatePerDay), laterCm3: volumeAt(scans.later.logRatePerDay) };
}
