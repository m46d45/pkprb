/**
 * Pemisah uji coba dan validasi workshop.
 * Batas hari: 23 Oktober 2026 pukul 00:00 WIB (awal KoNTekS 20).
 * Sebelum batas = pilot. Pada batas dan sesudahnya = validasi.
 * Kolom `fase` yang sudah terisi menang atas waktu.
 */

export const FASE_PILOT = "pilot";
export const FASE_VALIDASI = "validasi";

/** Padanan ISO dari literal SQL `2026-10-23 00:00:00+07`. */
export const BATAS_VALIDASI_ISO = "2026-10-23T00:00:00+07:00";

/** Literal yang wajib sama dengan migrasi 0004. */
export const BATAS_VALIDASI_SQL = "2026-10-23 00:00:00+07";

export function faseDariWaktu(createdAt) {
  const t = createdAt instanceof Date ? createdAt.getTime() : Date.parse(String(createdAt ?? ""));
  const batas = Date.parse(BATAS_VALIDASI_ISO);
  if (!Number.isFinite(t)) return FASE_VALIDASI;
  return t < batas ? FASE_PILOT : FASE_VALIDASI;
}

/** `pilot` / `validasi` tersimpan dipakai apa adanya. Nilai lain mengikuti waktu. */
export function hitungFase(faseTersimpan, createdAt) {
  if (faseTersimpan === FASE_PILOT || faseTersimpan === FASE_VALIDASI) return faseTersimpan;
  return faseDariWaktu(createdAt);
}
