import { describeContext, GENETIC_PROFILES, MEDICAL_HISTORIES, medicalHistoryNotes, STRESS_SCALE, type ContextSelection, type EvidenceNote, type FamilyHistory } from "../core/index.js";
import { RangeControl } from "./controls.js";

const families: ReadonlyArray<[FamilyHistory, string]> = [
  ["unknown", "Unknown"], ["none-reported", "None reported"], ["first-degree", "Affected relative"]
];

function StudyNote({ note }: { note: EvidenceNote }) {
  return <div className="cl-note"><h4>{note.headline}</h4><p>{note.detail}</p><a href={note.source.url}>{note.source.label}</a></div>;
}

function GeneticFigure({ label, mechanism }: { label?: string; mechanism?: string }) {
  return <figure className="cl-gene-figure">
    <h3>Where the finding applies</h3>
    <div className="cl-gene-pair">
      {["Non-tumor cell", "Tumor cell"].map((name, i) => <div key={name}>
        <svg viewBox="0 0 120 80" aria-hidden="true">
          <path d={i ? "M105 39Q108 57 90 66Q75 76 59 70Q40 75 26 64Q7 52 14 36Q16 18 35 13Q55 3 68 10Q91 8 98 24Z" : "M104 40C104 61 85 72 61 72S15 62 15 42 32 10 60 9 104 20 104 40Z"} fill="#e7c7c7" stroke="#8d666c"/>
          <ellipse cx="60" cy="40" rx={i ? 26 : 19} ry={i ? 22 : 18} fill="#b1a3bd" stroke="#705e79"/>
          {label && <path d="m55 31 11 18 m0-18-11 18" stroke="#53355d" strokeWidth="4" strokeLinecap="round"/>}
          {i === 1 && <circle cx="79" cy="39" r="3" fill="#705e79"/>}
        </svg>
        <strong>{name}</strong><small>{i ? "Tumor-specific changes unknown" : label ? "Inherited finding present" : "Inherited status unspecified"}</small>
      </div>)}
    </div>
    <figcaption>{label ? <><b>{label}.</b> The mark identifies the reported inherited background in both cells. {mechanism && <>Related process: {mechanism.toLowerCase()}.</>}</> :
      "An inherited finding can occur throughout the body. A change found only in a tumor can arise during a person’s lifetime."}</figcaption>
    <a href="https://www.cancer.gov/about-cancer/causes-prevention/genetics">NCI · The genetics of cancer</a>
  </figure>;
}

export function ContextWorkbench({ selection, change, openExposure }: {
  selection: ContextSelection; change: (patch: Partial<Omit<ContextSelection,"cancer">>) => void; openExposure: () => void;
}) {
  const notes = describeContext(selection);
  const profiles = GENETIC_PROFILES[selection.cancer];
  const medicalOptions = MEDICAL_HISTORIES[selection.cancer];
  const selectedConditions = selection.medicalHistory ?? [];
  const nextScore = selection.nextStressScore ?? null;
  const chosen = profiles.find(profile => profile.id === selection.geneticProfile);
  return <section className="cl-context-work">
    <h2>Genetics, family history and stress</h2>
    <p>Set the background for both exposure plans. Each finding has its own evidence and time scale.</p>
    <div className="cl-context-grid">
      <section><h3>Inherited finding</h3>
        <div className="cl-presets" role="group" aria-label="Inherited finding">
          <button type="button" aria-pressed={selection.geneticProfile === null} onClick={() => change({geneticProfile:null})}>Unspecified</button>
          {profiles.map(profile => <button type="button" key={profile.id} aria-pressed={profile === chosen}
            onClick={() => change({geneticProfile:profile.id})}>{profile.label}</button>)}
        </div>
        <StudyNote note={notes.genetics}/>
      </section>
      <GeneticFigure label={chosen?.label} mechanism={chosen?.mechanism}/>
      <section><h3>Family history</h3><p>Has a biological parent, full sibling, or child had this cancer?</p>
        <div className="cl-presets" role="group" aria-label="Family history">{families.map(([id,label]) =>
          <button type="button" key={id} aria-pressed={selection.familyHistory === id} onClick={() => change({familyHistory:id})}>{label}</button>)}</div>
        <StudyNote note={notes.family}/>
      </section>
      <section><h3>Perceived stress</h3><p>Use an example total from the ten-item Perceived Stress Scale for the previous month.</p>
        <div className="cl-presets" role="group" aria-label="Stress score availability">
          <button type="button" aria-pressed={selection.stressScore === null} onClick={() => change({stressScore:null, nextStressScore:null})}>Unreported</button>
          <button type="button" aria-pressed={selection.stressScore !== null} onClick={() => change({stressScore:selection.stressScore ?? 20})}>Use example score</button>
        </div>
        {selection.stressScore !== null && <>
          <RangeControl label="PSS-10 total" unit="points" exact value={selection.stressScore} min={0} max={40} onChange={stressScore => change({stressScore})}/>
          <button type="button" className="cl-text-button" aria-expanded={nextScore !== null}
            onClick={() => change({nextStressScore: nextScore === null ? selection.stressScore : null})}>
            {nextScore === null ? "Add next month’s score" : "Remove next month’s score"}
          </button>
          {nextScore !== null && <RangeControl label="Next month PSS-10 total" unit="points" exact value={nextScore} min={0} max={40} onChange={nextStressScore => change({nextStressScore})}/>}
        </>}
        <StudyNote note={notes.stress}/><a href={STRESS_SCALE.source.url}>{STRESS_SCALE.source.label}</a>
      </section>
      {medicalOptions.length > 0 && <section><h3>Medical history</h3>
        <p>Select diagnosed conditions for this example.</p>
        <div className="cl-presets" role="group" aria-label="Medical history">
          {medicalOptions.map(item => {
            const selected = selectedConditions.includes(item.id);
            return <button type="button" key={item.id} aria-pressed={selected}
              onClick={() => change({medicalHistory: selected ? selectedConditions.filter(id => id !== item.id) : [...selectedConditions, item.id]})}>{item.label}</button>;
          })}
        </div>
        {medicalHistoryNotes(selection).map(note => <StudyNote key={note.headline} note={note}/>)}
      </section>}
    </div>
    <button type="button" className="cl-action" onClick={openExposure}>View this exposure plan</button>
  </section>;
}
