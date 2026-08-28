/** Bivariate 3×3 (risiko × pendidikan). Data colors — not brand chrome. */
export const BIVARIATE: string[][] = [
  ["#e6e1d6", "#b9d0d6", "#5f97a8"],
  ["#e0c4b0", "#a89a96", "#5c7c90"],
  ["#c45c48", "#8e5870", "#3f3a6e"],
];

/** 3×3 historis × pusat (same layout as keselarasan). */
export const RESPONS: string[][] = [
  ["#e8e2d6", "#a8c4c8", "#3d7f92"],
  ["#e0b8a8", "#a89a96", "#4a6a7a"],
  ["#c45c48", "#8e5870", "#2f4a58"],
];

export const RISK_RAMP = ["#f3ebe3", "#e8c4b0", "#d4896a", "#c45c48", "#8f2f22"];
export const EDU_RAMP = ["#e7eef0", "#b9d0d6", "#7eafbc", "#3d7f92", "#1b4f5c"];
/** Historis uses the warm ramp (korban jiwa). */
export const HIST_RAMP = RISK_RAMP;

/** Absolute caps so univariate maps are comparable, not stretched to 38 provinces. */
export const EDU_CAP = 4;
export const PUSAT_CAP = 3;
/** ln(1+5000) ≈ 8.52 — Aceh/Palu clip to 10; Cianjur ≈ 6. */
export const HIST_CAP = Math.log(1 + 5000);
export const RISK_CAP_HAZARD = 40;
export const RISK_CAP_COMPOSITE = 250;
export const DISPLAY_MIN = 1;
export const DISPLAY_MAX = 10;

export function riskCap(hazard?: string) {
  return hazard === "composite" ? RISK_CAP_COMPOSITE : RISK_CAP_HAZARD;
}

/** Map a raw score onto the shared 1–10 display scale. 0 raw → 1; cap → 10. */
export function toScale10(raw: number, cap: number) {
  if (cap <= 0) return DISPLAY_MIN;
  const t = Math.min(1, Math.max(0, raw / cap));
  return DISPLAY_MIN + (DISPLAY_MAX - DISPLAY_MIN) * t;
}

export function bivariateColor(riskClass: 0 | 1 | 2, eduClass: 0 | 1 | 2) {
  return BIVARIATE[riskClass][eduClass];
}

export function responsColor(
  historisClass: 0 | 1 | 2,
  pusatClass: 0 | 1 | 2,
  riskClass: 0 | 1 | 2 = 1,
) {
  if (historisClass === 0 && pusatClass === 0 && riskClass === 2) return "#9a3f32";
  return RESPONS[historisClass][pusatClass];
}

export function rampColor(ramp: string[], t: number) {
  const x = Math.min(1, Math.max(0, t));
  const i = Math.min(ramp.length - 1, Math.floor(x * (ramp.length - 1)));
  return ramp[i];
}
