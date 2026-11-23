import { FACTORS, projectExposure, type CancerId, type ExposureScenario, type FactorId } from "./exposure.js";

export const FIELD_WIDTH = 300;
export const FIELD_HEIGHT = 180;
const TAU = 2 * Math.PI;
const atlas = "https://www.histologyguide.com/slideview/";

export const TISSUE_ARCHITECTURES = {
  lung: { name: "Alveolar walls", description: "Thin walls divide the air spaces of the lung.", source: "https://training.seer.cancer.gov/anatomy/respiratory/passages/bronchi.html", cell: "alveolar lining cell" },
  oral: { name: "Oral mucosa", description: "Layers of squamous cells cover the underlying connective tissue.", source: atlas + "MHS-208-tongue/14-slide-1.html", cell: "squamous epithelial cell" },
  colorectal: { name: "Colonic crypts", description: "Cross sections of intestinal glands surround pale central spaces.", source: atlas + "MHS-274-colon/14-slide-1.html", cell: "crypt epithelial cell" },
  breast: { name: "Breast lobules", description: "Small groups of glandular units sit among fat and connective tissue.", source: atlas + "MH-174a-mammary-gland/18-slide-1.html", cell: "glandular epithelial cell" },
  melanoma: { name: "Epidermal junction", description: "The basal layer of skin contains melanocytes along the junction with the dermis.", source: atlas + "MHS-236-thin-skin/11-slide-1.html", cell: "epidermal cell" },
  liver: { name: "Hepatic plates", description: "Plates of liver cells radiate toward a central vein. Narrow sinusoids separate the plates.", source: atlas + "MH-126b-liver/15-slide-1.html", cell: "hepatocyte" },
  prostate: { name: "Prostatic glands", description: "Folded glandular linings open into irregular spaces within fibromuscular tissue.", source: atlas + "MH-183-prostate/19-slide-1.html", cell: "prostatic gland cell" },
  pancreatic: { name: "Exocrine acini", description: "Small groups of secretory cells form rosettes around narrow openings.", source: atlas + "MHS-211-pancreas/12-slide-1.html", cell: "acinar cell" },
} as const;

export type TissueSite = keyof typeof TISSUE_ARCHITECTURES;
export type ClusterPace = "steady" | "slow" | "fast";
export type ClusterCourse = "match" | "slower" | "plateau" | "regression";
type CellRole = "lining" | "support" | "pigment" | "clone";

interface Ellipse {
  x: number; y: number; rx: number; ry: number; angle: number;
}
export interface TissueCell extends Ellipse { id: number; role: CellRole; tone: number }
export interface TissueCavity extends Ellipse { folds: number; phase: number; kind: "lumen" | "fat" }
export interface TissueField { cancer: TissueSite; cells: TissueCell[]; cavities: TissueCavity[]; clones: TissueCell[] }

function hash(text: string) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function sequence(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function surfaceY(cancer: TissueSite, x: number) {
  return (cancer === "melanoma" ? 102 : 124) + 11 * Math.sin(x / 25) + 5 * Math.cos(x / 11);
}

export function cavityPoint(cavity: TissueCavity, theta: number, scale = 1) {
  const wave = scale * (1 + cavity.folds * Math.sin(3 * theta + cavity.phase) + cavity.folds * 0.55 * Math.sin(5 * theta));
  const u = cavity.rx * Math.cos(theta) * wave, v = cavity.ry * Math.sin(theta) * wave;
  return { x: cavity.x + u * Math.cos(cavity.angle) - v * Math.sin(cavity.angle), y: cavity.y + u * Math.sin(cavity.angle) + v * Math.cos(cavity.angle) };
}

export function createTissueField(cancer: TissueSite, seed = 71): TissueField {
  if (!Object.hasOwn(TISSUE_ARCHITECTURES, cancer) || !Number.isSafeInteger(seed)) throw new RangeError("The tissue site or seed is invalid.");
  const random = sequence(hash(cancer) ^ seed);
  const noise = (amount: number) => (random() - .5) * amount;
  const cells: TissueCell[] = [], cavities: TissueCavity[] = [], clones: TissueCell[] = [];
  function cell(x: number, y: number, rx: number, ry: number, angle: number, role: CellRole = "lining") {
    if (x < 1 || x > FIELD_WIDTH - 1 || y < 1 || y > FIELD_HEIGHT - 1) return;
    cells.push({ x, y, rx, ry, angle, role, id: cells.length, tone: random() });
  }
  function ring(x: number, y: number, rx: number, ry: number, angle: number, folds: number, kind: TissueCavity["kind"] = "lumen") {
    const shape = { x, y, rx, ry, angle, folds, phase: random() * TAU, kind };
    cavities.push(shape);
    if (kind === "fat") return;
    const count = Math.max(7, Math.round(Math.PI * (rx + ry) / (cancer === "lung" ? 8 : 6)));
    for (let i = 0; i < count; i++) {
      const theta = TAU * (i + random() * .25) / count;
      const pt = cavityPoint(shape, theta, cancer === "lung" ? 1.03 : 1 + 3 / rx);
      const tangent = Math.atan2(ry * Math.cos(theta), -rx * Math.sin(theta)) + angle;
      const thin = cancer === "lung";
      cell(pt.x + noise(1.3), pt.y + noise(1.3), thin ? 4.3 : 3.4, thin ? 1.6 : 4.9, tangent + noise(.32));
    }
  }
  if (cancer === "oral" || cancer === "melanoma") {
    for (let row = 0; row < 10; row++) for (let i = 0; i < 32; i++) {
      const x = i * 10 + (row % 2) * 4 + noise(3.5);
      const y = surfaceY(cancer, x) - row * (cancer === "oral" ? 10.2 : 8.4) + noise(3);
      const pigment = cancer === "melanoma" && row === 0 && i % 4 === 1;
      cell(x, y, 4.3 + row * .27, 5.1 - row * .35, noise(.5), pigment ? "pigment" : "lining");
    }
  } else if (cancer === "liver") {
    ring(145, 84, 17, 13, -.25, .05);
    for (let ray = 0; ray < 22; ray++) for (let n = 0; n < 16; n++) {
      const radius = 24 + n * 10.7;
      const angle = TAU * ray / 22 + .1 * Math.sin(radius / 32 + ray);
      cell(145 + radius * Math.cos(angle) + noise(2), 84 + radius * Math.sin(angle) + noise(2), 5.7, 4.8, angle + noise(.9));
      if (radius > 68) cell(145 + radius * Math.cos(angle + .1), 84 + radius * Math.sin(angle + .1), 5.2, 4.7, angle + .2);
    }
  } else if (cancer === "breast") {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) ring(12 + c * 48 + noise(10), 9 + r * 56 + noise(12), 21 + random() * 4, 21 + random() * 4, noise(.8), .05, "fat");
    for (const [x,y] of [[42,36],[135,109],[239,42],[266,158],[26,160]]) {
      for (let k = 0; k < 6; k++) ring(x + 20 * Math.cos(TAU * k / 6), y + 18 * Math.sin(TAU * k / 6), 5 + random() * 3, 6 + random() * 3, random() * TAU, .04);
    }
  } else {
    const lattice = {
      lung: [58, 45, 28, 21, .13], colorectal: [43, 48, 10, 14, .04],
      prostate: [72, 64, 24, 17, .21], pancreatic: [24, 22, 3.5, 3, .07],
    }[cancer];
    const [dx, dy, rx, ry, folds] = lattice;
    for (let r = 0; r <= Math.ceil(FIELD_HEIGHT / dy); r++) for (let c = -1; c <= Math.ceil(FIELD_WIDTH / dx); c++) {
      const x = 10 + c * dx + (r % 2) * dx * .5 + noise(dx * .18);
      const y = 10 + r * dy + noise(dy * .18);
      ring(x, y, rx * (1 + noise(.3)), ry * (1 + noise(.3)), noise(.85), folds);
    }
  }
  for (let i = 0; i < 125; i++) {
    const x = random() * FIELD_WIDTH, y = random() * FIELD_HEIGHT;
    if ((cancer === "oral" || cancer === "melanoma") && y < surfaceY(cancer, x) + 7) continue;
    if (cavities.some(c => {
      const dx = x - c.x, dy = y - c.y;
      return ((dx * Math.cos(c.angle) + dy * Math.sin(c.angle)) / (c.rx + 4)) ** 2 + ((dy * Math.cos(c.angle) - dx * Math.sin(c.angle)) / (c.ry + 4)) ** 2 < 1;
    })) continue;
    cell(x, y, 3.9, 1.35, .5 * Math.sin(y / 21) + noise(1), "support");
  }
  const originY = cancer === "melanoma" || cancer === "oral" ? surfaceY(cancer, 135) - 3 : 89;
  const center = cells.filter(c => c.role === (cancer === "melanoma" ? "pigment" : "lining"))
    .reduce((a, b) => Math.hypot(b.x - 135, b.y - originY) < Math.hypot(a.x - 135, a.y - originY) ? b : a);
  for (let i = 0; i < 96; i++) {
    const r = 4.4 * Math.sqrt(i), theta = i * 2.39996 + noise(.15);
    clones.push({ id: cells.length + i, role: "clone", x: center.x + r * Math.cos(theta), y: center.y + r * .78 * Math.sin(theta),
      rx: 4 + random() * 1.7, ry: 3.2 + random() * 1.1, angle: random() * TAU, tone: random() });
  }
  return { cancer, cells, cavities, clones };
}

export function cloneCount(year: number, pace: ClusterPace = "slow") {
  if (!Number.isFinite(year) || year < 0 || !["steady", "slow", "fast"].includes(pace)) throw new RangeError("Invalid illustration time or pace.");
  const rate = { steady: 0, slow: .8, fast: 2.3 }[pace];
  return Math.min(96, 5 + Math.floor(year * rate));
}

/** A user-assigned drawing course. No exposure coefficient enters the count. */
export function compareCloneCounts(year: number, pace: ClusterPace, course: ClusterCourse, changeYear: number | null) {
  const continued = cloneCount(year, pace);
  if (!["match", "slower", "plateau", "regression"].includes(course)) throw new RangeError("Invalid illustration course.");
  if (changeYear !== null && (!Number.isFinite(changeYear) || changeYear < 0)) throw new RangeError("Invalid illustration change year.");
  if (changeYear === null || year <= changeYear || course === "match") return { continued, changed: continued };
  const atChange = cloneCount(changeYear, pace);
  const elapsed = year - changeYear;
  if (course === "plateau") return { continued, changed: atChange };
  if (course === "regression") return { continued, changed: Math.max(0, atChange - Math.floor(elapsed * .8)) };
  return { continued, changed: cloneCount(changeYear + elapsed / 3, pace) };
}

export interface TissueChannel {
  factor: FactorId; label: string; unit: string; totalUnit: string; rate: number; total: number;
  color: string; symbol: "arc" | "dots" | "bar" | "ring" | "diamond"; level: number;
}

const marks: Readonly<Record<FactorId, readonly [string, TissueChannel["symbol"]]>> = {
  smoking: ["#a53426", "arc"], radon: ["#196e77", "dots"], pm25: ["#3a548c", "bar"],
  alcohol: ["#b24c22", "ring"], areca: ["#1e737c", "bar"], "processed-meat": ["#7a4c05", "diamond"],
  activity: ["#17636a", "bar"], bmi: ["#344e85", "dots"], sunburns: ["#994720", "arc"],
  "indoor-tanning": ["#23667d", "bar"], "vitamin-e": ["#954c13", "ring"],
  "secondhand-smoke": ["#824788", "ring"], silica: ["#675108", "diamond"], "diesel-exhaust": ["#3d4668", "arc"],
  "smokeless-tobacco": ["#684588", "diamond"], "dietary-fiber": ["#52672c", "ring"],
  "leisure-sitting": ["#714977", "arc"], sunscreen: ["#675415", "diamond"],
  coffee: ["#714527", "diamond"], selenium: ["#265e53", "arc"],
};

export function tissueChannels(cancer: CancerId, scenarios: readonly ExposureScenario[], year: number) {
  if (!Number.isFinite(year) || year < 0) throw new RangeError("Invalid illustration time.");
  const continued: TissueChannel[] = [], changed: TissueChannel[] = [];
  const included = new Set<string>();
  for (const s of scenarios) {
    if (cancer !== s.cancer || included.has(s.factor)) throw new RangeError("Each tissue factor must match the selected cancer and appear once.");
    included.add(s.factor);
    if (!Object.hasOwn(marks, s.factor)) continue;
    const time = Math.min(s.horizonYears, year);
    const result = projectExposure({ ...s, horizonYears: time });
    const factor = FACTORS[s.factor];
    const [color, symbol] = marks[s.factor];
    function channel(rate: number, total: number, markRate = rate): TissueChannel {
      // Both quantities set the visibility of a drawing mark, not a biological parameter.
      const rateSpan = factor.max - factor.min;
      const rateFraction = Math.min(1, Math.max(0, (markRate - factor.min) / rateSpan));
      const referenceYear = factor.durationThreshold === undefined ? factor.max * factor.totalPerRateYear : 1;
      const historyFraction = 1 - Math.exp(-total / Math.max(.01, referenceYear * 12));
      return { factor: s.factor, label: factor.label, unit: factor.unit, totalUnit: factor.totalUnit, rate, total, color, symbol,
        level: .58 * Math.sqrt(rateFraction) + .42 * historyFraction };
    }
    continued.push(channel(s.initialRate, result.continuedTotal));
    // The table updates at the switch. Its drawn mark changes after time passes.
    const switched = time >= s.changeYear;
    const rate = switched ? s.changedRate : s.initialRate;
    const transition = Math.min(1, Math.max(0, time - s.changeYear));
    const markRate = s.initialRate + transition * (rate - s.initialRate);
    changed.push(channel(rate, result.changedTotal, markRate));
  }
  return { continued, changed };
}

/** A deterministic display threshold for a cell mark. A visible mark has no histologic interpretation. */
export function markStrength(cell: TissueCell, channel: TissueChannel) {
  const value = Math.imul((cell.id + 1) ^ hash(channel.factor), 2654435761) >>> 0;
  return Math.max(0, Math.min(1, (channel.level - value / 4294967296) * 5));
}
