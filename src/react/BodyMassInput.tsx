import { useState } from "react";
import { adultBmi, FACTORS } from "../core/index.js";
import { format, RangeControl } from "./controls.js";

export function BodyMassInput({ apply }: { apply: (value: number, which: "initialRate" | "changedRate") => void }) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(98);
  const bmi = adultBmi(weight, height);
  const {min, max, step} = FACTORS.bmi;
  const rounded = Math.round(bmi / step) * step;
  const outside = bmi < min || bmi > max;
  return <section className="cl-bmi-input"><h3>Calculate BMI from measurements</h3>
    <RangeControl label="Adult height" exact unit="cm" min={120} max={220} value={height} onChange={setHeight}/>
    <RangeControl label="Body weight" exact unit="kg" min={35} max={220} step={.5} value={weight} onChange={setWeight}/>
    <p>Calculated BMI <strong>{format(bmi, 2)} kg/m²</strong>. {outside
      ? "This value is outside the range of the example controls."
      : "The exposure sliders use the nearest " + step + " kg/m²."}</p>
    <div className="cl-presets" role="group" aria-label="Apply calculated BMI">
      <button type="button" disabled={outside} onClick={() => apply(rounded, "initialRate")}>Use for current BMI</button>
      <button type="button" disabled={outside} onClick={() => apply(rounded, "changedRate")}>Use for new BMI</button>
    </div>
  </section>;
}
