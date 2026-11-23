import type { CancerId } from "../core/index.js";

const studies = {
  lung: {
    title: "Smoking after a lung cancer diagnosis",
    text: "Researchers followed 517 people who smoked at diagnosis with stage IA to IIIA non-small cell lung cancer. At five years, 54.4% of those who quit and 43.8% of those who continued were alive without progression. People chose whether to quit. The study measured group outcomes.",
    label: "Sheikh et al., prospective cohort study", url: "https://pubmed.ncbi.nlm.nih.gov/34310171/"
  },
  oral: {
    title: "Smoking during head and neck cancer treatment",
    text: "Continued smoking can make treatment less effective and increase the chance of a second primary cancer. A second primary cancer is a new cancer that starts independently of the first tumor.",
    label: "National Cancer Institute, head and neck cancers", url: "https://www.cancer.gov/types/head-and-neck/head-neck-fact-sheet"
  },
  colorectal: {
    title: "Exercise after colon cancer treatment",
    text: "A randomized trial compared three years of structured exercise with health education after colon cancer surgery and chemotherapy. At five years, disease-free survival was 80.3% with exercise and 73.9% with health education. The trial studied people after treatment for colon cancer.",
    label: "Courneya et al., CHALLENGE trial", url: "https://pubmed.ncbi.nlm.nih.gov/40450658/"
  },
  breast: {
    title: "Activity after a breast cancer diagnosis",
    text: "Researchers followed 2,987 women with stage I to III breast cancer. Women who reported more physical activity after diagnosis had a lower risk of death from breast cancer. Health differences between the groups can affect this association.",
    label: "Holmes et al., Nurses’ Health Study", url: "https://pubmed.ncbi.nlm.nih.gov/15914748/"
  },
  melanoma: {
    title: "A second melanoma after surgery",
    text: "A US registry study tracked adults after surgery for skin melanoma. The estimated chance of a second primary melanoma was 3.9% at five years and 6.7% at ten years. A second primary melanoma starts separately from the first tumor.",
    label: "Wiener et al., US cancer registry study", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11898002/"
  },
  liver: {
    title: "Alcohol after liver cancer surgery",
    text: "An observational study examined 92 people with alcohol-related liver disease after surgery for hepatocellular carcinoma. Five-year survival was 76% in the abstinence group and 57% in the other group. The study found no clear difference in survival without recurrence.",
    label: "Osaka City University, surgical cohort", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8346358/"
  },
  prostate: {
    title: "Activity after a prostate cancer diagnosis",
    text: "Researchers studied men with nonmetastatic prostate cancer who survived at least four years after an activity survey. Men who reported at least three hours of vigorous activity per week had a lower rate of death from prostate cancer. The comparison group reported less than one hour per week.",
    label: "Kenfield et al., Health Professionals Follow-Up Study", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3056656/"
  },
  pancreatic: {
    title: "Inherited BRCA variants and pancreatic cancer treatment",
    text: "The POLO trial enrolled people with metastatic pancreatic cancer and an inherited BRCA1 or BRCA2 mutation. Their cancer had remained stable or responded to platinum chemotherapy. Median time without progression was 7.4 months with maintenance olaparib and 3.8 months with placebo.",
    label: "Golan et al., randomized POLO trial", url: "https://pubmed.ncbi.nlm.nih.gov/31157963/"
  }
} satisfies Record<CancerId, { title: string; text: string; label: string; url: string }>;

export function AfterDiagnosis({ cancer }: { cancer: CancerId }) {
  const study = studies[cancer];
  return <section className="cl-study"><h3>{study.title}</h3><p>{study.text}</p>
    <a href={study.url}>{study.label}</a>
  </section>;
}
