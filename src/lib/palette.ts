/** Bivariate 3×3 (risiko × IDPKI). Data colors — not brand chrome. */
export const BIVARIATE: string[][] = [
  ["#e6e1d6", "#b9d0d6", "#5f97a8"],
  ["#e0c4b0", "#a89a96", "#5c7c90"],
  ["#c45c48", "#8e5870", "#3f3a6e"],
];

export const RISK_RAMP = ["#f3ebe3", "#e8c4b0", "#d4896a", "#c45c48", "#8f2f22"];
export const EDU_RAMP = ["#e7eef0", "#b9d0d6", "#7eafbc", "#3d7f92", "#1b4f5c"];

export function bivariateColor(riskClass: 0 | 1 | 2, eduClass: 0 | 1 | 2) {
  return BIVARIATE[riskClass][eduClass];
}

export function rampColor(ramp: string[], t: number) {
  const x = Math.min(1, Math.max(0, t));
  const i = Math.min(ramp.length - 1, Math.floor(x * (ramp.length - 1)));
  return ramp[i];
}
