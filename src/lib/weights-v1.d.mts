export const V1_META: {
  nValidator: number;
  ambang: number;
  frozenAt: string;
  frozenLabel: string;
  sourceFile: string;
  label: string;
  shortLabel: string;
};

export const V1_KEPT_HAZARDS: ReadonlyArray<readonly [string, string]>;

export type V1ChangedCell = {
  hazard: string;
  discipline: string;
  hazardLabel: string;
  disciplineLabel: string;
  bawaan: number;
  median: number;
  status: string;
};

export function applyFrozenMedian(
  snapshot: {
    n_jawaban?: number;
    ambang?: number;
    matriks?: Record<
      string,
      Record<string, { bawaan?: number; median?: number; status?: string }>
    >;
  },
  v0: Record<string, Record<string, number>>,
): {
  weights: Record<string, Record<string, number>>;
  changed: V1ChangedCell[];
};
