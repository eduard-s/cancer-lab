"use client";

import { useState } from "react";
import type { CancerId } from "../core/exposure.js";

const publicDomain = {
  author: "Mikael Häggström, M.D.",
  license: "CC0 1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
};

const specimens = {
  lung: {
    title: "Squamous cell carcinoma of the lung",
    description: "A lung biopsy shows a compact cluster of tumor cells. The purple dots are cell nuclei.",
    alt: "A dense cluster of cells with purple nuclei fills the center of the pink lung tissue section.",
    source: "https://commons.wikimedia.org/wiki/File:Histopathology_of_squamous-cell_carcinoma_of_the_lung.jpg",
    ...publicDomain,
  },
  oral: {
    title: "Oral squamous cell carcinoma",
    description: "The pink whorl near the center contains keratin. This feature can occur in a well-differentiated squamous cell carcinoma.",
    alt: "Layers of pink cells form a swirl inside a nest of purple cells in oral tissue.",
    source: "https://commons.wikimedia.org/wiki/File:Oral_cancer_(1)_squamous_cell_carcinoma_histopathology.jpg",
    author: "KGH",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  colorectal: {
    title: "Colorectal carcinoma",
    description: "Fragments of dead cells fill the central gland space. Pathologists call this pattern dirty necrosis.",
    alt: "A gland in colorectal tumor tissue surrounds dark pink and purple debris in its central space.",
    source: "https://commons.wikimedia.org/wiki/File:Micrograph_of_colorectal_carcinoma_with_dirty_necrosis.jpg",
    ...publicDomain,
  },
  breast: {
    title: "Invasive ductal carcinoma of the breast",
    description: "Clusters of tumor cells extend into fat. The large pale spaces at the right mark fat cells.",
    alt: "Pink and purple tumor tissue meets large pale fat cells along the right edge of the breast tissue section.",
    source: "https://commons.wikimedia.org/wiki/File:Histopathology_of_invasive_ductal_carcinoma,_intermediate_magnification.jpg",
    ...publicDomain,
  },
} satisfies Partial<Record<CancerId, {
  title: string;
  description: string;
  alt: string;
  source: string;
  author: string;
  license: string;
  licenseUrl: string;
}>>;

export function TissueFigure({ cancer }: { cancer: CancerId }) {
  const [enlarged, setEnlarged] = useState(false);
  if (!Object.hasOwn(specimens, cancer)) return null;
  const specimen = specimens[cancer as keyof typeof specimens];

  return (
    <figure className="cl-tissue">
      <div className="cl-tissue-window">
        <div
          className="cl-tissue-field"
          data-tissue={cancer}
          data-enlarged={enlarged}
          role="img"
          aria-label={specimen.alt}
        />
        <button
          type="button"
          className="cl-tissue-zoom"
          aria-label="Enlarge tissue detail"
          aria-pressed={enlarged}
          onClick={() => setEnlarged(!enlarged)}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="10" cy="10" r="6.5" />
            <path d="m15 15 5 5 M7 10h6" />
            {!enlarged && <path d="M10 7v6" />}
          </svg>
        </button>
      </div>
      <figcaption>
        <span className="cl-tissue-label">Reference micrograph</span>
        <strong className="cl-tissue-title">{specimen.title}</strong>
        <p className="cl-tissue-note">{specimen.description}</p>
        <p className="cl-tissue-credit">
          <a href={specimen.source}>{specimen.author}</a> · <a href={specimen.licenseUrl}>{specimen.license}</a>
        </p>
      </figcaption>
    </figure>
  );
}
