import type { DisciplineId, HazardId } from "@/lib/types";
import { DISCIPLINES, HAZARDS } from "@/lib/types";

export const DISCIPLINE_LABEL: Record<DisciplineId, string> = {
  sipil: "Teknik Sipil",
  bencana: "Prodi Kebencanaan",
  pwk: "PWK",
  geologi: "Teknik Geologi",
  arsitektur: "Arsitektur",
  lingkungan: "Teknik Lingkungan",
  kelautan: "Teknik Kelautan",
};

export const HAZARD_LABEL: Record<HazardId, string> = {
  composite: "Komposit infrastruktur",
  gempa: "Gempabumi",
  tsunami: "Tsunami",
  banjir: "Banjir",
  longsor: "Tanah longsor",
  likuefaksi: "Likuefaksi",
  gunungapi: "Gunung api",
  karhutla: "Karhutla",
};

export const VIEW_LABEL = {
  keselarasan: "Keselarasan 3×3",
  risiko: "Risiko",
  idpki: "IDPKI",
} as const;

/** Default relevance 0–1 per discipline × hazard (Delphi prior). */
export const DEFAULT_WEIGHTS: Record<HazardId, Record<DisciplineId, number>> = {
  gempa: {
    sipil: 1, bencana: 0.85, pwk: 0.4, geologi: 0.9,
    arsitektur: 0.55, lingkungan: 0.25, kelautan: 0.25,
  },
  tsunami: {
    sipil: 0.7, bencana: 0.9, pwk: 0.8, geologi: 0.65,
    arsitektur: 0.35, lingkungan: 0.4, kelautan: 0.9,
  },
  banjir: {
    sipil: 0.85, bencana: 0.85, pwk: 0.85, geologi: 0.35,
    arsitektur: 0.3, lingkungan: 0.75, kelautan: 0.35,
  },
  longsor: {
    sipil: 0.9, bencana: 0.8, pwk: 0.55, geologi: 0.95,
    arsitektur: 0.25, lingkungan: 0.4, kelautan: 0.15,
  },
  likuefaksi: {
    sipil: 1, bencana: 0.7, pwk: 0.35, geologi: 0.9,
    arsitektur: 0.25, lingkungan: 0.2, kelautan: 0.15,
  },
  gunungapi: {
    sipil: 0.55, bencana: 0.85, pwk: 0.5, geologi: 0.95,
    arsitektur: 0.3, lingkungan: 0.4, kelautan: 0.1,
  },
  karhutla: {
    sipil: 0.25, bencana: 0.8, pwk: 0.45, geologi: 0.25,
    arsitektur: 0.15, lingkungan: 0.7, kelautan: 0.05,
  },
  composite: {
    sipil: 0.85, bencana: 0.85, pwk: 0.55, geologi: 0.7,
    arsitektur: 0.4, lingkungan: 0.45, kelautan: 0.4,
  },
};

export function cloneDefaultWeights() {
  const out = {} as Record<HazardId, Record<DisciplineId, number>>;
  for (const h of HAZARDS) {
    out[h] = { ...DEFAULT_WEIGHTS[h] };
  }
  return out;
}

export const ALL_DISCIPLINES_ON = Object.fromEntries(
  DISCIPLINES.map((d) => [d, true]),
) as Record<DisciplineId, boolean>;
