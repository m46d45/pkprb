export type StatusAgregasi = "setuju" | "usul naik" | "usul turun" | null;

export function median(values: number[]): number | null;

export function statusSel(medianValue: number | null, bawaan: number | null): StatusAgregasi;

export function defaultsFromWeightTables(
  weights: {
    [hazard: string]: { [discipline: string]: number } | undefined;
  },
  strata: { S1?: number; S2?: number; S3?: number },
  acc: {
    internasional?: number;
    unggul?: number;
    "baik-sekali"?: number;
    baik?: number;
  },
): {
  matriks: Record<string, Record<string, number | null>>;
  jenjang: { s1: number | null; s2: number | null; s3: number | null };
  akreditasi: {
    acc_int: number | null;
    acc_unggul: number | null;
    acc_bs: number | null;
    acc_baik: number | null;
  };
};

export function agregasiValidasi(
  rows: unknown[],
  defaults: {
    matriks?: Record<string, Record<string, number | null>>;
    jenjang?: { s1?: number | null; s2?: number | null; s3?: number | null };
    akreditasi?: {
      acc_int?: number | null;
      acc_unggul?: number | null;
      acc_bs?: number | null;
      acc_baik?: number | null;
    };
  },
): {
  n_jawaban: number;
  ambang: number;
  matriks: Record<string, Record<string, Record<string, unknown>>>;
  jenjang: Record<string, Record<string, unknown>>;
  akreditasi: Record<string, Record<string, unknown>>;
  pilihan: Record<string, Record<string, unknown>>;
};
