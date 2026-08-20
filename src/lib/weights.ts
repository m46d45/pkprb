import type { AccLevel, DisciplineId, HazardId, StrataLevel } from "@/lib/types";
import { HAZARDS } from "@/lib/types";

export const DISCIPLINE_LABEL: Record<DisciplineId, string> = {
  sipil: "Teknik Sipil",
  arsitektur: "Arsitektur",
  pwk: "Planologi",
  geologi: "Teknik Geologi",
  lingkungan: "Teknik Lingkungan",
  kelautan: "Teknik Kelautan",
  bencana: "Kebencanaan",
  multidisiplin: "Multidisiplin",
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
  idpki: "Pendidikan",
  risiko: "Risiko",
  keselarasan: "Keselarasan",
  historis: "Historis",
  pusat: "Pusat",
  respons: "Respons",
} as const;

export const STRATA_LABEL: Record<StrataLevel, string> = {
  S1: "S1",
  S2: "S2",
  S3: "S3",
};

export const ACC_LABEL: Record<AccLevel, string> = {
  internasional: "Internasional",
  unggul: "Unggul",
  "baik-sekali": "Baik Sekali",
  baik: "Baik",
};

/** Default relevance 0–1 per discipline × hazard (Delphi prior). */
export const DEFAULT_WEIGHTS: Record<HazardId, Record<DisciplineId, number>> = {
  gempa: {
    sipil: 1, arsitektur: 0.55, pwk: 0.4, geologi: 0.9,
    lingkungan: 0.25, kelautan: 0.25, bencana: 0.85, multidisiplin: 0.7,
  },
  tsunami: {
    sipil: 0.7, arsitektur: 0.35, pwk: 0.8, geologi: 0.65,
    lingkungan: 0.4, kelautan: 0.9, bencana: 0.9, multidisiplin: 0.75,
  },
  banjir: {
    sipil: 0.85, arsitektur: 0.3, pwk: 0.85, geologi: 0.35,
    lingkungan: 0.75, kelautan: 0.35, bencana: 0.85, multidisiplin: 0.8,
  },
  longsor: {
    sipil: 0.9, arsitektur: 0.25, pwk: 0.55, geologi: 0.95,
    lingkungan: 0.4, kelautan: 0.15, bencana: 0.8, multidisiplin: 0.7,
  },
  likuefaksi: {
    sipil: 1, arsitektur: 0.25, pwk: 0.35, geologi: 0.9,
    lingkungan: 0.2, kelautan: 0.15, bencana: 0.7, multidisiplin: 0.55,
  },
  gunungapi: {
    sipil: 0.55, arsitektur: 0.3, pwk: 0.5, geologi: 0.95,
    lingkungan: 0.4, kelautan: 0.1, bencana: 0.85, multidisiplin: 0.7,
  },
  karhutla: {
    sipil: 0.25, arsitektur: 0.15, pwk: 0.45, geologi: 0.25,
    lingkungan: 0.7, kelautan: 0.05, bencana: 0.8, multidisiplin: 0.75,
  },
  composite: {
    sipil: 0.85, arsitektur: 0.4, pwk: 0.55, geologi: 0.7,
    lingkungan: 0.45, kelautan: 0.4, bencana: 0.85, multidisiplin: 0.8,
  },
};

export const DEFAULT_STRATA: Record<StrataLevel, number> = {
  S1: 1,
  S2: 1,
  S3: 1,
};

export const DEFAULT_ACC: Record<AccLevel, number> = {
  internasional: 1,
  unggul: 0.9,
  "baik-sekali": 0.8,
  baik: 0.7,
};

export const DEFAULT_CENTER_WEIGHT = 1;
export const DEFAULT_KEPAKARAN_WEIGHT = 1;
export const DEFAULT_SPILLOVER_WEIGHT = 1;

export function cloneDefaultWeights() {
  const out = {} as Record<HazardId, Record<DisciplineId, number>>;
  for (const h of HAZARDS) {
    out[h] = { ...DEFAULT_WEIGHTS[h] };
  }
  return out;
}
