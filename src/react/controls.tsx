import { useId, useState } from "react";

export function format(value: number, digits = 1) {
  const options = value !== 0 && Math.abs(value) < 10 ** -digits
    ? { maximumSignificantDigits: 2 } : { maximumFractionDigits: digits };
  return new Intl.NumberFormat("en-US", options).format(value);
}

interface RangeProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  exact?: boolean;
  compact?: boolean;
  onChange: (value: number) => void;
}
export function RangeControl({ label, unit, value, min, max, step = 1, exact = false, compact = false, onChange }: RangeProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  function commit() {
    if (draft !== null && draft.trim() && Number.isFinite(Number(draft))) {
      const bounded = Math.max(min, Math.min(max, Number(draft)));
      const snapped = min + Math.round((bounded - min) / step) * step;
      onChange(Number(Math.min(max, snapped).toFixed(6)));
    }
    setDraft(null);
  }
  return <div className={compact ? "cl-range cl-compact-rate" : "cl-range"}>
    <div><label className={compact ? "cl-visually-hidden" : undefined} htmlFor={id}>{label}</label>{exact
      ? <span className="cl-exact"><input type="number" aria-label={label + " in " + unit} min={min} max={max} step={step}
          value={draft ?? value} onFocus={e => e.currentTarget.select()} onChange={e => setDraft(e.currentTarget.value)}
          onBlur={commit} onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }} />{!compact && <small>{unit}</small>}</span>
      : <span aria-hidden="true">{format(value, 2)} <small>{unit}</small></span>}</div>
    <input type="range" id={id} min={min} max={max} step={step} value={value}
      aria-valuetext={format(value, 6) + " " + unit} onChange={event => onChange(event.currentTarget.valueAsNumber)} />
  </div>;
}
