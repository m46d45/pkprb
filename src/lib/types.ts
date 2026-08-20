export type ProvinceId = string;

export type HazardId =
  | "gempa"
  | "tsunami"
  | "banjir"
  | "longsor"
  | "likuefaksi"
  | "gunungapi"
  | "cuaca"
  | "composite";

export const HAZARDS: HazardId[] = [
  "composite",
  "gempa",
  "tsunami",
  "banjir",
  "longsor",
  "likuefaksi",
  "gunungapi",
  "cuaca",
];

export type DisciplineId =
  | "sipil"
  | "arsitektur"
  | "pwk"
  | "geologi"
  | "lingkungan"
  | "kelautan"
  | "bencana"
  | "multidisiplin";

export const VIEW_MODES = [
  "risiko",
  "idpki",
  "keselarasan",
  "historis",
  "pusat",
  "respons",
] as const;
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

export type WeightMap = Record<HazardId, Record<DisciplineId, number>>;

export type Program = {
  id: string;
  name: string;
  university: string;
  provinceId: ProvinceId;
  discipline: DisciplineId;
  strata: StrataId;
  accreditation: AccLevel | "none";
  iabee: IabeeStatus;
  notes?: string;
};

export type Center = {
  id: string;
  name: string;
  university: string;
  provinceId: ProvinceId;
  focus: string[];
  year?: number;
};

export type HistEvent = {
  id: string;
  year: number;
  name: string;
  provinceId: ProvinceId;
  hazard: HazardId;
  deaths: number;
  notes?: string;
};

export type Province = {
  id: ProvinceId;
  name: string;
  irbi: Record<Exclude<HazardId, "composite">, number>;
  population?: number;
};

export type Klass = 1 | 2 | 3;

export type ResponsQuadrant =
  | "responsif"
  | "tidak-melembaga"
  | "antisipatif"
  | "belum-terespons"
  | "menengah";

export type ScoredProvince = Province & {
  idpki: number;
  risiko: number;
  keselarasan: number;
  historis: number;
  pusat: number;
  klassIdpki: Klass;
  klassRisiko: Klass;
  klassHistoris: Klass;
  klassPusat: Klass;
  respons: ResponsQuadrant;
};
