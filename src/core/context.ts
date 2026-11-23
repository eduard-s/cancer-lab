import type { CancerId, EvidenceNote, EvidenceSource } from "./exposure-catalog.js";

export type FamilyHistory = "unknown" | "none-reported" | "first-degree";

export interface GeneticProfile {
  id: string;
  label: string;
  detail: string;
  /** Function of the gene or pathway. The lab assigns no numerical effect to it. */
  mechanism?: string;
  source: EvidenceSource;
}

export type MedicalHistoryId = "hepatitis-b" | "hepatitis-c" | "cirrhosis" | "chronic-pancreatitis" | "diabetes" | "colitis" | "atypical-nevi";

export interface ContextSelection {
  cancer: CancerId;
  /** Reports of this cancer in a biological parent, full sibling or child. */
  familyHistory: FamilyHistory;
  /** ID of a documented inherited finding for this cancer, or null if unknown. */
  geneticProfile: string | null;
  /** Total from a completed PSS-10 for the last month. Null means unreported. */
  stressScore: number | null;
  /** Completed PSS-10 for the next month, when a first score is available. */
  nextStressScore?: number | null;
  /** Diagnosed conditions reported for the selected cancer. Omission means unreported. */
  medicalHistory?: readonly MedicalHistoryId[];
}

const genetics = { label: "NCI · Inherited cancer risk", url: "https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet" };
const brca = { label: "NCI · BRCA1 and BRCA2 risks", url: "https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet" };
const colorectal = { label: "NCI · Genetics of colorectal cancer", url: "https://www.cancer.gov/types/colorectal/hp/colorectal-genetics-pdq" };
const cdkn2a = { label: "GeneReviews · CDKN2A cancer predisposition", url: "https://www.ncbi.nlm.nih.gov/books/NBK616232/" };
const prostate = { label: "NCI · Genetics of prostate cancer", url: "https://www.cancer.gov/types/prostate/hp/prostate-genetics-pdq" };
const liver = { label: "NCI · Liver cancer prevention", url: "https://www.cancer.gov/types/liver/hp/liver-prevention-pdq" };

function brcaVariant(gene: "BRCA1" | "BRCA2", detail: string): GeneticProfile {
  return { id: gene.toLowerCase(), label: gene + " pathogenic variant", detail,
    mechanism: "Repair of DNA double-strand breaks", source: brca };
}

export const GENETIC_PROFILES: Readonly<Record<CancerId, readonly GeneticProfile[]>> = {
  lung: [{
    id: "egfr-t790m", label: "Inherited EGFR T790M",
    detail: "The INHERIT study identified families with inherited EGFR T790M and lung adenocarcinoma. An EGFR result from a tumor alone cannot establish inheritance.",
    mechanism: "Growth-factor receptor signaling",
    source: { label: "Oxnard et al. · INHERIT study, 2023", url: "https://pubmed.ncbi.nlm.nih.gov/37579253/" },
  }],
  oral: [{
    id: "fanconi", label: "Fanconi anemia",
    detail: "People with Fanconi anemia have increased risk of squamous cell carcinoma, often in the oral cavity. This profile describes a diagnosed syndrome.",
    mechanism: "DNA cross-link repair",
    source: { label: "GeneReviews · Fanconi anemia", url: "https://www.ncbi.nlm.nih.gov/books/NBK1401/" },
  }],
  colorectal: [{
    id: "lynch", label: "Lynch syndrome",
    detail: "Lynch syndrome increases colorectal cancer risk. The specific inherited variant affects the age and chance of cancer.",
    mechanism: "DNA mismatch repair", source: colorectal,
  }, {
    id: "apc-fap", label: "APC-associated polyposis",
    detail: "Inherited pathogenic APC variants cause familial adenomatous polyposis or its attenuated form. Polyps can start early and increase colorectal cancer risk.",
    mechanism: "Control of intestinal cell proliferation", source: colorectal,
  }],
  breast: [
    brcaVariant("BRCA1", "NCI estimates that more than 60% of women with a harmful inherited BRCA1 variant develop breast cancer during their lifetime. This is a group estimate."),
    brcaVariant("BRCA2", "NCI estimates that more than 60% of women with a harmful inherited BRCA2 variant develop breast cancer during their lifetime. This is a group estimate."),
  ],
  melanoma: [{
    id: "cdkn2a", label: "CDKN2A pathogenic variant",
    detail: "GeneReviews reports lifetime melanoma risks of 28–76% in people with CDKN2A predisposition. These estimates vary with geography and sun exposure.",
    mechanism: "Cell-cycle control", source: cdkn2a,
  }],
  liver: [{
    id: "hemochromatosis", label: "Hereditary hemochromatosis",
    detail: "Hereditary hemochromatosis can cause iron overload and cirrhosis. Untreated disease increases hepatocellular carcinoma risk. This profile describes a diagnosed condition.",
    mechanism: "Regulation of iron stores", source: liver,
  }],
  prostate: [{
    id: "hoxb13-g84e", label: "HOXB13 G84E",
    detail: "The inherited HOXB13 G84E variant increases prostate cancer susceptibility. Study estimates vary with age, family history and ancestry.",
    mechanism: "Regulation of gene expression in prostate cells", source: prostate,
  }, brcaVariant("BRCA2", "NCI estimates that 19–61% of men with a harmful inherited BRCA2 variant develop prostate cancer by age 80. This range describes studied groups.")],
  pancreatic: [
    brcaVariant("BRCA2", "NCI estimates that 5–10% of people with a harmful inherited BRCA2 variant develop pancreatic cancer during their lifetime. This is a group estimate."),
    { id: "cdkn2a", label: "CDKN2A pathogenic variant",
      detail: "Harmful inherited CDKN2A variants increase the risk of pancreatic cancer as well as cutaneous melanoma. Risk differs among families.",
      mechanism: "Cell-cycle control", source: cdkn2a },
  ],
};

/** The PSS-10 measures self-reported perceived stress during the previous month. */
export const STRESS_SCALE = {
  label: "Perceived Stress Scale (PSS-10)", min: 0, max: 40, unit: "points", period: "Previous month",
  source: { label: "Cohen laboratory · Perceived Stress Scale", url: "https://www.cmu.edu/dietrich/psychology/stress-immunity-disease-lab/scales/" },
} as const;

const familyNotes: Record<CancerId, string> = {
  lung: "Families can share inherited susceptibility and exposures such as cigarette smoke.",
  oral: "Shared exposures such as tobacco can contribute to an oral cancer history in a family.",
  colorectal: "The age at diagnosis, number of relatives with cancer and history of polyps help characterize the family history.",
  breast: "Cancer type and age at diagnosis in relatives on either side of the family can help characterize inherited breast cancer susceptibility.",
  melanoma: "A family history of melanoma can reflect shared traits, inherited variants and sun exposure.",
  liver: "A family history of liver cancer can reflect shared exposures or an inherited disorder. The diagnosis alone cannot identify the cause.",
  prostate: "The number of relatives with prostate cancer and their age at diagnosis help characterize the family history.",
  pancreatic: "Pancreatic cancer in relatives can occur with an inherited syndrome or without a known gene change.",
};

const familySources: Record<CancerId, EvidenceSource> = {
  lung: { label: "NCI · Lung cancer prevention", url: "https://www.cancer.gov/types/lung/hp/lung-prevention-pdq" },
  oral: genetics, colorectal, breast: brca,
  melanoma: { label: "NCI · Risk factors for melanoma", url: "https://www.cancer.gov/types/skin/moles-fact-sheet" },
  liver, prostate,
  pancreatic: { label: "NCI · Pancreatic cancer risk factors", url: "https://www.cancer.gov/types/pancreatic/causes-risk-factors" },
};

interface MedicalHistory {
  id: MedicalHistoryId;
  label: string;
  detail: string;
  source: EvidenceSource;
}

export const MEDICAL_HISTORIES: Readonly<Record<CancerId, readonly MedicalHistory[]>> = {
  lung: [], oral: [], breast: [], prostate: [],
  liver: [
    { id: "hepatitis-b", label: "Chronic hepatitis B", detail: "Chronic hepatitis B increases hepatocellular carcinoma risk. It can cause liver cancer even in people without cirrhosis.", source: liver },
    { id: "hepatitis-c", label: "Chronic hepatitis C", detail: "Chronic hepatitis C increases hepatocellular carcinoma risk. NCI reports that heavy alcohol use and chronic hepatitis C together can raise risk further.", source: liver },
    { id: "cirrhosis", label: "Cirrhosis", detail: "Cirrhosis is advanced liver scarring. It increases hepatocellular carcinoma risk. The cause and severity of scarring affect that risk. Heavy alcohol use can cause cirrhosis.", source: liver },
  ],
  pancreatic: [
    { id: "chronic-pancreatitis", label: "Chronic pancreatitis", detail: "Long-term inflammation can damage the pancreas and increase the risk of pancreatic cancer.", source: familySources.pancreatic },
    { id: "diabetes", label: "Diabetes", detail: "People with diabetes have an increased risk of pancreatic cancer. A pancreatic tumor can also cause new diabetes. The order of the diagnoses matters.", source: familySources.pancreatic },
  ],
  colorectal: [
    { id: "colitis", label: "Inflammatory bowel disease of the colon", detail: "Long-standing ulcerative colitis or Crohn disease that affects the colon increases colorectal cancer risk. Duration of inflammation matters.", source: { label: "NCI · Colorectal cancer prevention", url: "https://www.cancer.gov/types/colorectal/hp/colorectal-prevention-pdq" } },
  ],
  melanoma: [
    { id: "atypical-nevi", label: "Atypical moles", detail: "People with atypical moles (dysplastic nevi) have increased melanoma risk. Most of these moles never become melanoma.", source: familySources.melanoma },
  ],
};

/** Read selected findings in catalog order. Each condition has its own source. */
export function medicalHistoryNotes(selection: ContextSelection): EvidenceNote[] {
  const { cancer, medicalHistory = [] } = selection;
  if (!Object.hasOwn(MEDICAL_HISTORIES, cancer) || !Array.isArray(medicalHistory)) throw new RangeError("Invalid medical history.");
  const selected = new Set(medicalHistory);
  const siteFindings = MEDICAL_HISTORIES[cancer].filter(item => selected.has(item.id));
  if (selected.size !== siteFindings.length || selected.size !== medicalHistory.length) {
    throw new RangeError("Choose each medical history once for a supported cancer type.");
  }
  return siteFindings.map(({ label: headline, detail, source }) => ({ headline, detail, source }));
}

/** Interpret context independently of cumulative exposure, cancer incidence or scan calculations. */
export function describeContext(selection: ContextSelection): { family: EvidenceNote; genetics: EvidenceNote; stress: EvidenceNote & { changePoints: number | null } } {
  const { cancer, familyHistory, geneticProfile, stressScore, nextStressScore = null } = selection;
  if (!Object.hasOwn(GENETIC_PROFILES, cancer)) throw new RangeError("Unknown cancer type.");
  const profile = GENETIC_PROFILES[cancer].find(item => item.id === geneticProfile);
  if (geneticProfile !== null && !profile) throw new RangeError("This inherited profile is unavailable for the selected cancer.");
  for (const score of [stressScore, nextStressScore]) {
    if (score === null || (Number.isInteger(score) && score >= 0 && score <= 40)) continue;
    throw new RangeError("A PSS-10 total must be a whole number from 0 to 40.");
  }
  if (nextStressScore !== null && stressScore === null) throw new RangeError("Enter the first monthly score before the next.");
  const changePoints = stressScore === null || nextStressScore === null ? null : nextStressScore - stressScore;
  let stressHeadline = stressScore === null ? "No stress score reported" : "PSS-10 total: " + stressScore + " of 40";
  if (changePoints !== null) {
    const signed = changePoints > 0 ? "+" + changePoints : String(changePoints);
    stressHeadline = `PSS-10: ${stressScore} to ${nextStressScore} of 40 (${signed} ${Math.abs(changePoints) === 1 ? "point" : "points"})`;
  }
  const familyLabels = {
    unknown: "Family history unknown",
    "none-reported": "No affected first-degree relative reported",
    "first-degree": "Affected first-degree relative",
  };
  if (!Object.hasOwn(familyLabels, familyHistory)) throw new RangeError("Unknown family history.");
  return {
    family: {
      headline: familyLabels[familyHistory],
      detail: familyHistory === "first-degree" ? familyNotes[cancer] :
        "A first-degree relative is a biological parent, full sibling or child. An incomplete or negative family history cannot establish inherited risk.",
      source: familyHistory === "first-degree" ? familySources[cancer] : genetics,
    },
    genetics: profile ? { headline: profile.label, detail: profile.detail, source: profile.source } :
      { headline: "No inherited finding specified", detail: "Choose a documented hereditary syndrome or inherited pathogenic variant. An uncertain variant or a finding in tumor tissue alone does not establish inherited risk.", source: genetics },
    stress: {
      headline: stressHeadline,
      changePoints,
      detail: "The score records self-reported stress in the previous month. A higher score means more perceived stress. Human studies do not establish a direct effect on an individual tumor’s growth or survival.",
      source: { label: "NCI · Stress and cancer", url: "https://www.cancer.gov/about-cancer/coping/feelings/stress-fact-sheet" },
    },
  };
}

/** Adult body mass index, in kg/m², from weight in kilograms and height in centimeters. */
export function adultBmi(weightKg: number, heightCm: number): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
    throw new RangeError("Weight and height must be finite positive numbers.");
  }
  const value = weightKg / (heightCm / 100) ** 2;
  if (!Number.isFinite(value) || value <= 0) throw new RangeError("The calculated BMI is outside the numeric range.");
  return value;
}
