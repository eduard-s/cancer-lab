# Cancer Lab model

## Exposure history

The chart compares two histories. Both start with the same past exposure. One continues at the current rate. The other uses the new rate from the selected year.

| Factor | Cancer type | Input | Total for one year at that rate |
| --- | --- | --- | --- |
| Cigarette smoking | Lung, oral cavity, colorectal, liver, pancreatic | Cigarettes/day | Daily count ÷ 20, in pack-years |
| Indoor radon | Lung | Bq/m³ | Concentration × 1 year, in Bq·years/m³ |
| Alcohol | Oral cavity, colorectal, breast, liver | Grams of ethanol/day | Daily grams × 365.25 ÷ 1,000, in kg of ethanol |
| Processed meat | Colorectal | Grams/day | Daily grams × 365.25 ÷ 1,000, in kg |
| Moderate physical activity | Colorectal, breast, liver | Minutes/week | Weekly minutes × 365.25 ÷ 7 ÷ 60, in hours |
| Outdoor PM₂.₅ | Lung | Annual mean, µg/m³ | Concentration × 1 year, in µg·years/m³ |
| Areca nut | Oral cavity | Chewing episodes/day | Daily episodes × 365.25, in episodes |
| Blistering sunburns | Melanoma | Burns/year | Annual count, in burns |
| Indoor UV tanning | Melanoma | Sessions/year | Annual count, in sessions |
| Adult body mass index (BMI) | Colorectal, breast, liver, prostate, pancreatic | kg/m² | One year if BMI ≥30, otherwise zero years |
| Synthetic vitamin E supplements | Prostate | International units/day | Daily units × 365.25, in international units |
| Secondhand smoke | Lung | Hours/week | Weekly hours × 365.25 ÷ 7, in hours |
| Workplace silica dust | Lung | Mean workday concentration, µg/m³ | Concentration × 1 working year, in µg·years/m³ |
| Workplace diesel exhaust | Lung | Mean work-shift concentration, µg of respirable elemental carbon (EC)/m³ | Concentration × 1 working year, in µg EC·years/m³ |
| Smokeless tobacco | Oral cavity, pancreatic | Uses/day | Daily uses × 365.25, in uses |
| Dietary fiber from food | Colorectal | Grams/day | Daily grams × 365.25 ÷ 1,000, in kg of fiber |
| Leisure sitting time | Breast | Hours/day | Daily hours × 365.25, in hours seated |
| Sunscreen use | Melanoma | Days/week | Weekly days × 365.25 ÷ 7, in days of use |
| Coffee intake | Liver | Cups/day | Daily cups × 365.25, in cups |
| Selenium supplements | Prostate | Micrograms/day | Daily micrograms × 365.25 ÷ 1,000, in mg of selenium |

The model multiplies each annual total by the years at that rate. It adds the totals for each period. A rate of zero adds zero exposure. Past exposure stays in the total.

For example, 20 cigarettes a day for 10 years give 10 pack-years. Ten more years at the same rate give 20 pack-years. If the person stops today, the total stays at 10 pack-years. [NCI definition of a pack-year](https://www.cancer.gov/publications/dictionaries/cancer-terms/def/pack-year)

## Risk of a new cancer

Relative risk compares the chance of cancer in two groups. Each factor has its own evidence. The model gives no combined risk score.

- **Cigarettes.** After people stop, the extra risk from smoking decreases by about half in 10–15 years for lung cancer. For oral cavity cancer, this takes about 5–10 years. Pancreatic cancer risk approaches that of people who do not smoke after about 20 years. These times apply after a complete stop. [CDC report](https://www.cdc.gov/tobacco/hcp/patient-care-settings/cancer.html)
- **Radon.** WHO estimates about 16% more relative lung cancer risk per 100 Bq/m³ increase in long-term average concentration. For concentration `C` in Bq/m³, the model uses `1 + 0.16 × C / 100`. The ratio of two results compares sustained concentrations. The chart measures concentration over time. An estimate of absorbed radiation dose needs more data. [WHO radon fact sheet](https://www.who.int/news-room/fact-sheets/detail/radon-and-health)
- **Alcohol.** One US standard drink contains about 14 g of ethanol. Less alcohol can reduce oral cavity cancer risk. Evidence about how risk changes after people stop is limited for breast, colorectal and liver cancer. [NCI alcohol fact sheet](https://www.cancer.gov/about-cancer/causes-prevention/risk/alcohol/alcohol-fact-sheet) · [IARC review](https://dceg.cancer.gov/news-events/news/2024/iarc-handbook-alcohol)
- **Processed meat.** IARC reported about 18% more relative colorectal cancer risk for each extra 50 g per day in the usual diet. The estimate supplies no recovery time after a change in diet. [IARC evaluation](https://www.iarc.who.int/wp-content/uploads/2018/07/pr240_E.pdf)
- **Physical activity.** Nine cohorts linked the equivalent of 150–300 minutes of moderate activity per week to 6–10% less relative breast cancer risk. For colon cancer in men, the estimate was 8–14% less risk. For liver cancer, the estimate was 18–27% less risk. The comparison group reported no leisure activity. [Matthews study](https://pubmed.ncbi.nlm.nih.gov/31877085/)
- **Fine particles.** Outdoor particulate matter causes lung cancer. The model adds annual outdoor concentrations over time. A personal inhaled dose also depends on the air in other locations. [IARC evaluation](https://www.iarc.who.int/wp-content/uploads/2018/07/pr221_QA.pdf)
- **Areca nut.** Oral cancer risk decreases after a person stops areca nut use. This applies to preparations with and without tobacco. The model counts episodes. [IARC handbook](https://handbooks.iarc.who.int/documents-handbooks/hb19/vol19-evaluations.pdf)
- **Ultraviolet radiation.** Severe sunburns and indoor UV tanning increase skin melanoma risk. A count describes past events. Lamp output, skin sensitivity and session length affect the UV dose. Burns can occur at any age. [NCI melanoma fact sheet](https://www.cancer.gov/types/skin/moles-fact-sheet) · [Lazovich study](https://pubmed.ncbi.nlm.nih.gov/20507845/)
- **Adult BMI.** BMI equals weight in kilograms divided by the square of height in meters. The chart counts years in the CDC obesity category for adults aged 20 or older. The threshold defines a category. Cancer risk can vary within that category. The breast evidence concerns risk after menopause. The prostate evidence concerns advanced disease. [CDC categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html) · [NCI obesity fact sheet](https://www.cancer.gov/about-cancer/causes-prevention/risk/obesity/obesity-fact-sheet) · [WCRF prostate report](https://www.wcrf.org/wp-content/uploads/2024/10/prostate-cancer-report.pdf)
- **Vitamin E supplements.** SELECT compared synthetic vitamin E at 400 IU/day with placebo in men. At seven years on average, the group that took vitamin E alone had about 17% higher relative prostate cancer incidence. This estimate applies to the trial dose. [NCI trial results](https://www.cancer.gov/types/prostate/research/select-trial-results-qa)
- **Secondhand smoke.** Exposure to other people's tobacco smoke causes lung cancer in people who do not smoke. Hours near smoke measure duration. The inhaled dose also depends on smoke concentration. [NCI fact sheet](https://www.cancer.gov/about-cancer/causes-prevention/risk/substances/secondhand-smoke)
- **Workplace silica dust.** European and Canadian researchers linked greater cumulative silica exposure with higher lung cancer odds, including among people who never smoked. The lab uses an 8-hour workday average for respirable crystalline silica. For example, 100 µg/m³ over 10 working years gives 1,000 µg·years/m³, equal to 1 mg·year/m³. [Ge study](https://pmc.ncbi.nlm.nih.gov/articles/PMC7465090/)
- **Workplace diesel exhaust.** A study of US miners linked cumulative diesel exposure with lung cancer mortality. The researchers estimated exposure from respirable elemental carbon in workplace air. Roadside particle measurements use a different setting and can include other sources. [Silverman study](https://pubmed.ncbi.nlm.nih.gov/37549095/)
- **Smokeless tobacco.** Oral tobacco products can cause mouth and pancreatic cancer. The number of uses measures frequency. Products and portion sizes vary. A preparation that contains both tobacco and areca nut can appear in both rows. [NCI definition](https://www.cancer.gov/publications/dictionaries/cancer-terms/def/smokeless-tobacco)
- **Dietary fiber.** The European EPIC study linked an extra 10 g/day of fiber from food to a colorectal cancer hazard ratio of 0.87. The 95% confidence interval was 0.79–0.96. The study compared usual diets. [Murphy study](https://pubmed.ncbi.nlm.nih.gov/22761771/)
- **Leisure sitting time.** A US cohort compared women who sat at least 6 hours a day during leisure time with women who sat under 3 hours. The relative risk for invasive breast cancer was 1.10, with a 95% confidence interval of 1.00–1.21. The estimate had substantial uncertainty. [Patel study](https://pubmed.ncbi.nlm.nih.gov/26126627/)
- **Sunscreen use.** An Australian trial compared daily sunscreen on the head and arms with discretionary use. Follow-up identified 11 melanomas in the daily group and 22 in the other group. The confidence interval for all melanomas included no difference. The chart counts days of use. It gives no estimate of ultraviolet dose. [Green trial](https://pubmed.ncbi.nlm.nih.gov/21135266/)
- **Coffee intake.** A US cohort compared people who drank 2–3 cups per day with people who drank no coffee. The group that drank coffee had a lower rate of hepatocellular carcinoma. People chose their own intake. This study cannot establish a preventive effect. Cup size and caffeine content can vary. [Setiawan study](https://pubmed.ncbi.nlm.nih.gov/25305507/)
- **Selenium supplements.** SELECT found no preventive benefit for prostate cancer with 200 µg/day of selenium as L-selenomethionine. The trial compared this supplement alone or with vitamin E against placebo. The chart records supplemental selenium separately from dietary intake. [SELECT trial](https://pubmed.ncbi.nlm.nih.gov/21990298/)

## Family history, inherited risk, medical history and stress

A first-degree relative is a biological parent, full sibling or child. Families can share exposures and inherited variants. The lab records the family history separately from a documented inherited finding. A tumor-only result does not establish an inherited variant. [NCI genetic testing fact sheet](https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet)

| Cancer type | Inherited finding in the lab |
| --- | --- |
| Lung | [Inherited EGFR T790M](https://pubmed.ncbi.nlm.nih.gov/37579253/) |
| Oral cavity | [Fanconi anemia](https://www.ncbi.nlm.nih.gov/books/NBK1401/) |
| Colorectal | [Lynch syndrome or APC-associated polyposis](https://www.cancer.gov/types/colorectal/hp/colorectal-genetics-pdq) |
| Breast | [BRCA1 or BRCA2 pathogenic variant](https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet) |
| Melanoma | [CDKN2A pathogenic variant](https://www.ncbi.nlm.nih.gov/books/NBK616232/) |
| Liver | [Hereditary hemochromatosis](https://www.cancer.gov/types/liver/hp/liver-prevention-pdq) |
| Prostate | [HOXB13 G84E or a BRCA2 pathogenic variant](https://www.cancer.gov/types/prostate/hp/prostate-genetics-pdq) |
| Pancreatic | [BRCA2 pathogenic variant](https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet) or [CDKN2A pathogenic variant](https://www.ncbi.nlm.nih.gov/books/NBK616232/) |

The inherited risk estimates describe groups with a specific variant. For example, NCI reports a 5–10% lifetime pancreatic cancer risk for people with a harmful inherited BRCA2 variant. The lab keeps these estimates separate from the exposure totals. [NCI BRCA fact sheet](https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet)

Medical history describes diagnosed conditions. Chronic hepatitis and cirrhosis increase liver cancer risk. Heavy alcohol use and chronic hepatitis C together can increase this risk further. [NCI liver cancer summary](https://www.cancer.gov/types/liver/hp/liver-prevention-pdq)

Chronic pancreatitis and diabetes are risk factors for pancreatic cancer. A pancreatic tumor can also cause new diabetes. Long-term inflammation of the colon increases colorectal cancer risk. Atypical moles are a risk factor for melanoma. Each finding has its own evidence. [NCI pancreatic cancer summary](https://www.cancer.gov/types/pancreatic/causes-risk-factors) · [NCI colorectal cancer summary](https://www.cancer.gov/types/colorectal/hp/colorectal-prevention-pdq) · [NCI melanoma fact sheet](https://www.cancer.gov/types/skin/moles-fact-sheet)

The Perceived Stress Scale (PSS-10) records self-reported stress during the previous month. A completed score ranges from 0 to 40 points. A higher score means more perceived stress. The lab can compare two scores from consecutive months. It subtracts the first score from the second to give a change in points. No diagnostic cutoff applies.

Human evidence about a direct effect on cancer survival is weak. The score has no effect on tumor volume or the exposure totals. [Scale authors](https://www.cmu.edu/dietrich/psychology/stress-immunity-disease-lab/scales/) · [NCI stress fact sheet](https://www.cancer.gov/about-cancer/coping/feelings/stress-fact-sheet)

## Tumor volume after diagnosis

Three example scans show one tumor at three times. The model compares two intervals. Each volume must be positive. Each scan date must come after the previous date.

The equations use the initial volume `V1` and the final volume `V2` in cm³. The interval `d` is in days.

```text
Volume change (%) = 100 × (V2 / V1 − 1)
Rate per day = (ln(V2) − ln(V1)) / d
Time to double (days) = ln(2) / rate       for a positive rate
Time to halve (days) = −ln(2) / rate      for a negative rate
```

These times assume a constant proportional rate within each interval. Equal volumes give a zero rate. A smaller positive rate in the second interval means that the tumor still grew, but more slowly. Measurement differences between scans can affect the rate. [Wilson volume method](https://pmc.ncbi.nlm.nih.gov/articles/PMC3262038/) · [Zhao repeat-scan study](https://pubmed.ncbi.nlm.nih.gov/19561260/)

For a direct comparison, both example volumes start at 1 cm³. The slider sets the same duration for both rates. Its limit is the shorter measured interval. The model calculates each example volume as `1 cm³ × exp(rate × days)`. For the first 90-day interval from 2 to 4 cm³, the example volume reaches 2 cm³ after 90 days. [Wilson volume method](https://pmc.ncbi.nlm.nih.gov/articles/PMC3262038/)

The exposure controls do not set tumor volume. In one lung cancer cohort, 54.4% of people who quit cigarettes were alive without progression at five years. The estimate was 43.8% for people who continued. The study included people with stage IA–IIIA non-small cell lung cancer who smoked at diagnosis. People chose whether to quit. These group estimates cannot give the growth rate of one tumor. [Sheikh study](https://pubmed.ncbi.nlm.nih.gov/34310171/)
