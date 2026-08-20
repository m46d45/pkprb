export const HAZARDS = [
  "composite",
  "gempa",
  "tsunami",
  "banjir",
  "longsor",
  "likuefaksi",
  "gunungapi",
  "karhutla",
] as const;

export type HazardId = (typeof HAZARDS)[number];

export const DISCIPLINES = [
  "sipil",
  "arsitektur",
  "pwk",
  "geologi",
  "lingkungan",
  "kelautan",
  "bencana",
  "multidisiplin",
] as const;

export type DisciplineId = (typeof DISCIPLINES)[number];

export const VIEW_MODES = ["idpki", "risiko", "keselarasan"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export type IabeeStatus = "none" | "provisional" | "general";
export type StrataId = "S1" | "S2" | "S3" | "D4";

export const STRATA_LEVELS = ["S1", "S2", "S3"] as const;
export type StrataLevel = (typeof STRATA_LEVELS)[number];

export const ACC_LEVELS = [
  "internasional",
  "unggul",
  "baik-sekali",
  "baik",
] as const;
export type AccLevel = (typeof ACC_LEVELS)[number];

export type RiskScores = Record<HazardId, number>;

export type Province = {
  id: string;
  name: string;
  geoName: string;
  kode: string;
  island: string;
  population: number;
  risk: RiskScores;
  riskNote: string;
};

export type Program = {
  id: string;
  university: string;
  program: string;
  discipline: DisciplineId;
  strata: StrataId;
  accreditation: string;
  city: string;
  province: string;
  iabee: IabeeStatus;
  source: string;
};

export type ResearchCenter = {
  id: string;
  university: string;
  name: string;
  province: string;
  hazards: HazardId[];
  maturity: "anchor" | "pui" | "standard";
  national: boolean;
  pkm: boolean;
  url: string;
  focus: string;
};

export type Quadrant =
  | "kesenjangan"
  | "selaras"
  | "surplus"
  | "beban-rendah"
  | "menengah";

export type ProvinceScore = {
  provinceId: string;
  risk: number;
  idpki: number;
  perJuta: number;
  capacity: number;
  education: number;
  research: number;
  service: number;
  spillover: number;
  riskClass: 0 | 1 | 2;
  eduClass: 0 | 1 | 2;
  quadrant: Quadrant;
  gap: number;
};
