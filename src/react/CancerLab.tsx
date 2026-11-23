"use client";

import { useId, useRef, useState } from "react";
import { CANCER_TYPES, type CancerId, type ContextSelection } from "../core/index.js";
import { ExposureWorkbench } from "./ExposureWorkbench.js";
import { ContextWorkbench } from "./ContextWorkbench.js";
import { TumorWorkbench } from "./TumorWorkbench.js";

type View = "exposure" | "context" | "measurements";
const views: ReadonlyArray<[View, string]> = [
  ["exposure", "Exposure & tissue"], ["context", "Genetics & stress"], ["measurements", "Tumor measurements"]
];

export interface CancerLabProps {
  initialCancer?: CancerId;
  initialView?: View;
}

export function CancerLab({ initialCancer = "lung", initialView = "exposure" }: CancerLabProps) {
  const [cancer, setCancer] = useState(initialCancer);
  const [view, setView] = useState(initialView);
  const [contexts, setContexts] = useState<Partial<Record<CancerId, ContextSelection>>>({});
  const selection = contexts[cancer] ?? { cancer, familyHistory: "unknown", geneticProfile: null, stressScore: null };
  const id = useId();
  const nav = useRef<HTMLDivElement>(null);
  function openView(next: View) {
    setView(next);
    nav.current?.querySelector<HTMLButtonElement>('[data-view="' + next + '"]')?.focus();
  }
  return <div className="cl-lab">
    <div className="cl-toolbar">
      <div className="cl-type-picker" role="group" aria-label="Cancer type">
        <span>Cancer type</span>
        {CANCER_TYPES.map(type => <button type="button" key={type.id} aria-pressed={cancer === type.id}
          onClick={() => setCancer(type.id)}>{type.label}</button>)}
      </div>
      <div className="cl-view-picker" role="group" aria-label="Lab view" ref={nav}>
        {views.map(([key, label]) => <button type="button" key={key} data-view={key} aria-controls={id + key}
          aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}
      </div>
    </div>
    <div id={id + "exposure"} hidden={view !== "exposure"}>
      <ExposureWorkbench cancer={cancer} active={view === "exposure"} context={selection}
        showContext={() => openView("context")} showMeasurements={() => openView("measurements")}/>
    </div>
    <div id={id + "context"} hidden={view !== "context"}>
      <ContextWorkbench selection={selection} change={patch => setContexts(previous => ({...previous, [cancer]: {...selection, ...patch}}))}
        openExposure={() => openView("exposure")}/>
    </div>
    <div id={id + "measurements"} hidden={view !== "measurements"}>
      <TumorWorkbench cancer={cancer}/>
    </div>
  </div>;
}
