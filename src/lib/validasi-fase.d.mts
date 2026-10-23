export const FASE_PILOT: "pilot";
export const FASE_VALIDASI: "validasi";
export const BATAS_VALIDASI_ISO: string;
export const BATAS_VALIDASI_SQL: string;

export type FaseValidasi = "pilot" | "validasi";

export function faseDariWaktu(createdAt: string | Date | null | undefined): FaseValidasi;

export function hitungFase(
  faseTersimpan: unknown,
  createdAt: string | Date | null | undefined,
): FaseValidasi;
