export const V2_META: {
  label: string;
  shortLabel: string;
  note: string;
};

export const V2_DISCIPLINES: readonly string[];

export function upliftV2(value: number): number;

export function deriveV2(
  v1: Record<string, Record<string, number>>,
): Record<string, Record<string, number>>;
