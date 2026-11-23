import type { EvidenceNote, EvidenceSource, ExposureMilestone, ExposureScenario } from "./exposure-catalog.js";

const sources = {
  cessation: { label: "CDC · Smoking cessation and cancer", url: "https://www.cdc.gov/tobacco/hcp/patient-care-settings/cancer.html" },
  tobacco: { label: "NCI · Cigarette smoking and quitting", url: "https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco/cessation-fact-sheet" },
  oral: { label: "NCI · Oral cavity cancer prevention", url: "https://www.cancer.gov/types/head-and-neck/hp/oral-prevention-pdq" },
  radon: { label: "WHO · Radon and health", url: "https://www.who.int/news-room/fact-sheets/detail/radon-and-health" },
  meat: { label: "IARC · Processed meat and cancer", url: "https://www.iarc.who.int/wp-content/uploads/2018/07/pr240_E.pdf" },
  alcohol: { label: "NCI · Alcohol and cancer risk", url: "https://www.cancer.gov/about-cancer/causes-prevention/risk/alcohol/alcohol-fact-sheet" },
  alcoholChange: { label: "NCI · IARC review of alcohol reduction", url: "https://dceg.cancer.gov/news-events/news/2024/iarc-handbook-alcohol" },
  breastAlcohol: { label: "Chen et al. · Nurses’ Health Study", url: "https://pubmed.ncbi.nlm.nih.gov/22045766/" },
  obesity: { label: "NCI · Obesity and cancer", url: "https://www.cancer.gov/about-cancer/causes-prevention/risk/obesity/obesity-fact-sheet" },
  bmi: { label: "CDC · Adult BMI categories", url: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html" },
  prostate: { label: "WCRF · Prostate cancer report", url: "https://www.wcrf.org/wp-content/uploads/2024/10/prostate-cancer-report.pdf" },
  select: { label: "NCI · SELECT trial results", url: "https://www.cancer.gov/types/prostate/research/select-trial-results-qa" },
  skin: { label: "NCI · Risk factors for melanoma", url: "https://www.cancer.gov/types/skin/moles-fact-sheet" },
  tanning: { label: "Lazovich et al. · Indoor UV tanning", url: "https://pubmed.ncbi.nlm.nih.gov/20507845/" },
  air: { label: "IARC · Outdoor air pollution and cancer", url: "https://www.iarc.who.int/wp-content/uploads/2018/07/pr221_QA.pdf" },
  areca: { label: "IARC · Oral cancer prevention", url: "https://handbooks.iarc.who.int/documents-handbooks/hb19/vol19-evaluations.pdf" },
  liver: { label: "NCI · Liver cancer prevention", url: "https://www.cancer.gov/types/liver/hp/liver-prevention-pdq" },
  activity: { label: "Matthews et al. · Nine prospective cohorts", url: "https://pubmed.ncbi.nlm.nih.gov/31877085/" },
  secondhand: { label: "NCI · Secondhand tobacco smoke", url: "https://www.cancer.gov/about-cancer/causes-prevention/risk/substances/secondhand-smoke" },
  silica: { label: "Ge et al. · Occupational silica and lung cancer", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7465090/" },
  diesel: { label: "Silverman et al. · Diesel Exhaust in Miners Study", url: "https://pubmed.ncbi.nlm.nih.gov/37549095/" },
  smokeless: { label: "NCI · Smokeless tobacco", url: "https://www.cancer.gov/publications/dictionaries/cancer-terms/def/smokeless-tobacco" },
  fiber: { label: "Murphy et al. · EPIC dietary fiber study", url: "https://pubmed.ncbi.nlm.nih.gov/22761771/" },
  sitting: { label: "Patel et al. · Cancer Prevention Study II", url: "https://pubmed.ncbi.nlm.nih.gov/26126627/" },
  sunscreen: { label: "Green et al. · Nambour sunscreen trial", url: "https://pubmed.ncbi.nlm.nih.gov/21135266/" },
  coffee: { label: "Setiawan et al. · US Multiethnic Cohort", url: "https://pubmed.ncbi.nlm.nih.gov/25305507/" },
} satisfies Record<string, EvidenceSource>;

export function getMilestone(scenario: ExposureScenario): ExposureMilestone | null {
  const yearsBeforeChange = scenario.historyYears + scenario.changeYear;
  if (yearsBeforeChange === 0 || scenario.changeYear > scenario.horizonYears || scenario.changedRate >= scenario.initialRate) return null;
  if (scenario.factor === "smoking" && scenario.changedRate === 0) {
    if (scenario.cancer === "pancreatic") return {
      label: "About 20 years after quitting",
      detail: "CDC reports that pancreatic cancer risk approaches the risk in people who do not smoke after about 20 years.",
      source: sources.cessation,
    };
    if (scenario.cancer !== "lung" && scenario.cancer !== "oral") return null;
    const lung = scenario.cancer === "lung";
    return {
      label: lung ? "10–15 years after quitting" : "5–10 years after quitting",
      window: lung ? [10, 15] : [5, 10],
      detail: lung
        ? "CDC reports that the extra lung cancer risk attributable to smoking falls by about half over this period. Historical pack-years stay on the chart."
        : "The extra oral cavity cancer risk attributable to smoking falls by about half over this period. Around 20 years after quitting, risk approaches that of people who do not smoke.",
      source: sources.cessation,
    };
  }
  if (scenario.factor === "areca" && scenario.changedRate === 0) {
    return {
      label: "After stopping areca nut",
      detail: "IARC found that oral cancer risk decreases after people stop using areca nut, with or without tobacco. It gives no fixed recovery time.",
      source: sources.areca,
    };
  }
  if (scenario.factor === "alcohol" && scenario.cancer === "oral") {
    return {
      label: "After reducing alcohol",
      detail: "IARC found sufficient evidence that reducing or stopping alcohol lowers the chance of developing oral cavity cancer. The studies do not establish a year-by-year change for this scenario.",
      source: sources.alcoholChange,
    };
  }
  return null;
}

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const alcoholEvidence: Partial<Record<ExposureScenario["cancer"], EvidenceNote>> = {
  oral: {
    headline: "Alcohol and oral cavity cancer",
    detail: "Oral cavity cancer risk rises with habitual alcohol intake. Tobacco and alcohol together increase the risk further.",
    source: sources.alcohol,
  },
  liver: {
    headline: "Alcohol and liver cancer",
    detail: "Heavy alcohol use can cause cirrhosis, which increases the risk of hepatocellular carcinoma. Chronic viral hepatitis also affects risk.",
    source: sources.liver,
  },
  breast: {
    headline: "Risk at lower daily intakes",
    detail: "In the Nurses’ Health Study, women averaging 5–9.9 g of alcohol per day had about 15% higher relative breast cancer risk than women reporting no alcohol.",
    source: sources.breastAlcohol,
  },
  colorectal: {
    headline: "Alcohol and colorectal cancer",
    detail: "NCI reports that moderate to heavy drinkers have about 1.2–1.5 times the colorectal cancer risk of people who do not drink.",
    source: sources.alcohol,
  },
};

const smokingEvidence: Partial<Record<ExposureScenario["cancer"], string>> = {
  lung: "Both the amount smoked and the years spent smoking affect lung cancer risk. The same pack-year total can represent different smoking histories.",
  oral: "Oral cavity cancer is more common in people who smoke. Tobacco and alcohol together increase risk further.",
  colorectal: "Smoking increases the risk of colon and rectal cancer. A pack-year count describes the history of cigarette use.",
  liver: "Smoking increases the risk of hepatocellular carcinoma. Chronic liver disease and viral hepatitis also affect risk.",
  pancreatic: "People who smoke cigarettes have an increased risk of pancreatic cancer. Risk decreases gradually after they quit.",
};

const activityEvidence: Partial<Record<ExposureScenario["cancer"], string>> = {
  breast: "Across nine cohorts, the equivalent of this amount of leisure activity was associated with 6–10% lower relative breast cancer risk compared with no leisure activity.",
  colorectal: "Across nine cohorts, the equivalent of this amount of leisure activity was associated with 8–14% lower relative colon cancer risk in men compared with no leisure activity. The estimate applies to the colon only.",
  liver: "Across nine cohorts, the equivalent of this amount of leisure activity was associated with 18–27% lower relative liver cancer risk compared with no leisure activity.",
};

export function getEvidence(scenario: ExposureScenario): EvidenceNote[] {
  const { cancer, factor, initialRate, changedRate } = scenario;
  switch (factor) {
    case "smoking":
      return [{
        headline: "Cigarette exposure and cancer",
        detail: smokingEvidence[cancer]!,
        source: cancer === "oral" ? sources.oral : sources.tobacco,
      }, {
        headline: "What changes after quitting?",
        detail: "The risk of a new cancer decreases over time after a person stops smoking. A reduction in cigarette count changes pack-years. Timelines for a complete stop apply only after the last cigarette.",
        source: sources.cessation,
      }];
    case "radon": {
      // WHO describes an approximately linear excess relative risk against 0 Bq/m³.
      // Compare two *long-term* concentrations. There is no cessation hazard curve here.
      const longTermRatio = (1 + 0.16 * initialRate / 100) / (1 + 0.16 * changedRate / 100);
      return [{
        headline: "Long-term residential radon",
        detail: "WHO estimates about 16% higher relative lung cancer risk per additional 100 Bq/m³ in long-term average concentration. Actual risk also depends strongly on smoking history.",
        source: sources.radon,
      }, {
        headline: "Comparing sustained concentrations",
        detail: `If maintained long term, ${initialRate} versus ${changedRate} Bq/m³ corresponds to about ${longTermRatio.toFixed(2)}× the relative risk in WHO’s linear model. This comparison does not predict how quickly risk changes after mitigation.`,
        source: sources.radon,
      }];
    }
    case "processed-meat":
      return [{
        headline: "About 18% higher relative risk per 50 g/day",
        detail: "IARC linked a sustained additional 50 g of processed meat per day to about 18% higher relative colorectal cancer risk. This compares groups with different habitual diets.",
        source: sources.meat,
      }, {
        headline: "Diet changes and follow-up",
        detail: "The chart tracks the amount eaten after a dietary change. The IARC estimate supplies no timetable for how quickly risk changes after cutting back.",
        source: sources.meat,
      }];
    case "alcohol": {
      return [alcoholEvidence[cancer]!, {
        headline: "Reading the alcohol amounts",
        detail: `The two rates correspond to ${number.format(initialRate / 14)} and ${number.format(changedRate / 14)} US standard drinks per day (14 g each). ${cancer === "oral" ? "Lower intake reduces a cause of oral cavity cancer." : "The evidence for a specific risk reduction after stopping is limited for this cancer."}`,
        source: sources.alcohol,
      }];
    }
    case "pm25":
      return [{
        headline: "Outdoor particulate matter and lung cancer",
        detail: "IARC identifies outdoor air pollution and its particulate matter as causes of lung cancer. The chart integrates the annual outdoor concentration over time. It cannot calculate an individual lung dose.",
        source: sources.air,
      }];
    case "secondhand-smoke":
      return [{
        headline: "Lung cancer in people who do not smoke",
        detail: "Breathing tobacco smoke from others causes lung cancer in people who do not smoke. Exposure hours alone cannot determine how much smoke a person inhaled.",
        source: sources.secondhand,
      }];
    case "silica":
      return [{
        headline: "Silica dust over a working lifetime",
        detail: "European and Canadian studies linked greater cumulative exposure to respirable crystalline silica with higher lung cancer odds. The researchers found this pattern in people who had never smoked as well.",
        source: sources.silica,
      }];
    case "diesel-exhaust":
      return [{
        headline: "Diesel exhaust in US miners",
        detail: "In eight nonmetal mines, researchers used respirable elemental carbon to estimate diesel exposure. They linked cumulative exposure to lung cancer mortality after adjustment for smoking.",
        source: sources.diesel,
      }];
    case "smokeless-tobacco":
      return [{
        headline: cancer === "oral" ? "Oral tobacco and mouth cancer" : "Oral tobacco and pancreatic cancer",
        detail: `Smokeless tobacco causes ${cancer === "oral" ? "oral cavity" : "pancreatic"} cancer. A count of uses records frequency. Products vary in composition, and the count gives no dose per use.`,
        source: sources.smokeless,
      }];
    case "dietary-fiber":
      return [{
        headline: "Food fiber in the European EPIC cohort",
        detail: "Each additional 10 g/day of habitual fiber intake was associated with a colorectal cancer hazard ratio of 0.87 (95% confidence interval 0.79–0.96). The study compared diets over time.",
        source: sources.fiber,
      }];
    case "leisure-sitting":
      return [{
        headline: "Time spent seated outside work",
        detail: "In one US cohort, women who reported at least 6 versus under 3 leisure sitting hours per day had an invasive breast cancer relative risk of 1.10. The 95% confidence interval was 1.00–1.21. This observational result cannot establish cause.",
        source: sources.sitting,
      }];
    case "sunscreen":
      return [{
        headline: "Daily and discretionary sunscreen use",
        detail: "An Australian trial recorded 11 melanomas in the daily-use group and 22 with discretionary use. The overall estimate included no difference within its 95% confidence interval. The trial supplied no effect estimate for each extra day of use.",
        source: sources.sunscreen,
      }];
    case "coffee":
      return [{
        headline: "Coffee intake and primary liver cancer",
        detail: "In a US cohort, people who reported 2–3 cups per day had a lower rate of hepatocellular carcinoma than people who drank no coffee. Participants chose their intake, so the study cannot establish a preventive effect.",
        source: sources.coffee,
      }];
    case "selenium":
      return [{
        headline: "The SELECT trial at 200 µg/day",
        detail: "SELECT tested 200 µg/day of selenium as L-selenomethionine in men. The trial found no preventive benefit for prostate cancer at this dose, alone or with vitamin E.",
        source: sources.select,
      }];
    case "areca":
      return [{
        headline: "Oral cancer and areca nut",
        detail: "Areca nut increases oral cancer risk even in betel quid without tobacco. Counts describe how often someone chews it. The amount in each preparation can differ.",
        source: sources.areca,
      }];
    case "sunburns":
      return [{
        headline: "A history of severe sunburn",
        detail: "People who report severe blistering sunburns have a higher risk of skin melanoma. The chart counts episodes from the average rate. UV exposure can also damage skin without a sunburn.",
        source: sources.skin,
      }];
    case "indoor-tanning":
      return [{
        headline: "UV exposure during tanning",
        detail: "A Minnesota study linked more indoor tanning sessions to higher melanoma risk. Lamp intensity, skin sensitivity and session length affect the UV exposure in each session.",
        source: sources.tanning,
      }];
    case "bmi": {
      let detail = "Cohort studies link excess body fat with a higher risk of this cancer. Weight alone does not establish a personal cancer risk.";
      if (cancer === "breast") detail = "Evidence links excess body fat to higher breast cancer risk after menopause. This association depends on menopausal status.";
      if (cancer === "prostate") detail = "WCRF links greater body fatness to advanced prostate cancer. Its finding concerns advanced disease. The chart does not predict a change in the stage of a tumor.";
      return [{
        headline: "Body fat and cancer risk",
        detail,
        source: cancer === "prostate" ? sources.prostate : sources.obesity,
      }, {
        headline: "Years in the adult BMI category",
        detail: "CDC defines obesity as BMI 30 kg/m² or higher for adults aged 20 or older. The chart counts years in this category. Crossing 30 does not switch cancer risk on or off.",
        source: sources.bmi,
      }];
    }
    case "vitamin-e":
      return [{
        headline: "The SELECT trial at 400 IU/day",
        detail: "Men assigned to 400 IU/day of synthetic vitamin E alone had about 17% higher relative prostate cancer incidence than the placebo group. Follow-up averaged seven years. The trial does not supply risk estimates for other doses.",
        source: sources.select,
      }];
    case "activity":
      return [{
        headline: "150–300 minutes of moderate activity per week",
        detail: activityEvidence[cancer]!,
        source: sources.activity,
      }, {
        headline: "How to read activity hours",
        detail: "A rising line means more time spent active. The study compared habitual activity levels and does not specify a recovery time when someone changes their routine.",
        source: sources.activity,
      }];
  }
}
