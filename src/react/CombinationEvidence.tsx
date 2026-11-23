import { type CancerId, type FactorId } from "../core/index.js";

export function CombinationEvidence({ cancer, factors }: { cancer: CancerId; factors: readonly FactorId[] }) {
  if (!factors.includes("smoking")) return null;
  if (cancer === "oral" && factors.includes("alcohol")) return <section className="cl-joint-study">
    <h3>Tobacco and alcohol together</h3>
    <p>In the INHANCE case-control studies, people who used both had 4.78 times the odds of oral cavity cancer compared with never-users of either. The 95% confidence interval was 2.59 to 8.81.</p>
    <p>The joint association was stronger than the product of the separate associations. This estimate describes exposure groups across studies.</p>
    <a href="https://doi.org/10.1158/1055-9965.EPI-08-0347">Hashibe et al. · INHANCE, Table 2</a>
  </section>;
  if (cancer !== "lung" || !factors.includes("radon")) return null;
  return <section className="cl-joint-study">
    <h3>Smoking and residential radon together</h3>
    <p>Researchers estimated the chance of death from lung cancer by age 75 at sustained radon concentrations. The estimates assume no competing causes of death.</p>
    <table className="cl-table"><caption>Population estimates from 13 European studies</caption>
      <thead><tr><th>Long-term radon</th><th>Never smoked</th><th>Continued smoking</th></tr></thead>
      <tbody>{[[0,"0.4%","10%"],[100,"0.5%","12%"],[400,"0.7%","16%"]].map(([dose,never,smoked]) =>
        <tr key={dose}><th scope="row">{dose} Bq/m³</th><td>{never}</td><td>{smoked}</td></tr>)}</tbody>
    </table>
    <p>The smoking group used 15–24 cigarettes per day. These lifetime histories differ from a plan that changes exposure partway through.</p>
    <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC546066/">Darby et al. · BMJ, figure 3</a>
  </section>;
}
