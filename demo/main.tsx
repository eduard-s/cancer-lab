import { createRoot } from "react-dom/client";
import { CancerLab } from "../src/react/index.js";
import "../src/react/styles.css";
import "./page.css";

createRoot(document.getElementById("root")!).render(
  <main>
    <header>
      <h1>Cancer Lab</h1>
      <p>Change several exposures, inspect the cells in both tissue fields, and explore the evidence for inherited risk.</p>
    </header>
    <CancerLab />
  </main>
);
