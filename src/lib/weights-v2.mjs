/**
 * V2 = V1 plus a researcher adjustment.
 * Workshop qualitative feedback: non-civil weights are still under-weighted.
 * Sipil and Kebencanaan stay at V1. Cap 1.
 *
 *   V1 < 0.40        → +0.125
 *   0.40 ≤ V1 ≤ 0.60 → +0.10
 *   V1 > 0.60        → +0.05
 */

export const V2_META = {
  label: "Penyesuaian peneliti",
  shortLabel: "V2 Penyesuaian",
  note: "Penyesuaian peneliti atas masukan kualitatif workshop: bobot non-sipil masih under-weighted.",
};

export const V2_DISCIPLINES = [
  "arsitektur",
  "pwk",
  "geologi",
  "lingkungan",
  "kelautan",
  "multidisiplin",
];

const UNCHANGED = ["sipil", "bencana"];

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

export function upliftV2(value) {
  if (!Number.isFinite(value)) throw new Error("Bobot V1 bukan angka.");
  let next = value;
  if (value < 0.4) next = value + 0.125;
  else if (value <= 0.6) next = value + 0.1;
  else next = value + 0.05;
  return Math.min(1, round3(next));
}

export function deriveV2(v1) {
  const weights = {};
  for (const hazard of Object.keys(v1)) {
    weights[hazard] = { ...v1[hazard] };
    for (const discipline of UNCHANGED) {
      if (discipline in v1[hazard]) weights[hazard][discipline] = v1[hazard][discipline];
    }
    for (const discipline of V2_DISCIPLINES) {
      if (!(discipline in v1[hazard])) {
        throw new Error(`V1 tidak memuat ${hazard} × ${discipline}.`);
      }
      weights[hazard][discipline] = upliftV2(v1[hazard][discipline]);
    }
  }
  return weights;
}
