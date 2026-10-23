/**
 * V1 dibekukan dari agregasi 24 jawaban validasi.
 * Sumber: src/data/v1-beku-20261023.json (bukan tarikan langsung).
 * Waktu beku: 23 Oktober 2026 pukul 17.02 WIB.
 *
 * Aturan: pada lima bahaya filter dan komposit, sel diganti median hanya bila
 * |median − bawaan| >= ambang (0,125, ketat — sama dengan statusSel).
 * Sel di dalam ambang tetap nilai bawaan V0. Gunung api dan karhutla tidak
 * diubah dari V0 dan tidak masuk filter peta.
 */

export const V1_META = {
  nValidator: 24,
  ambang: 0.125,
  frozenAt: "2026-10-23T17:02:00+07:00",
  frozenLabel: "23 Okt 2026 17.02 WIB",
  sourceFile: "src/data/v1-beku-20261023.json",
  label: "Tervalidasi (24 validator, dibekukan 23 Okt 2026 17.02 WIB)",
  shortLabel: "V1 Tervalidasi",
};

/** Bahaya yang boleh menerima median. Urutan sama dengan filter peta. */
export const V1_KEPT_HAZARDS = [
  ["composite", "Komposit"],
  ["gempa", "Gempabumi"],
  ["tsunami", "Tsunami"],
  ["banjir", "Banjir"],
  ["longsor", "Longsor"],
  ["likuefaksi", "Likuefaksi"],
];

const DISCIPLINES = [
  ["sipil", "Sipil"],
  ["arsitektur", "Arsitektur"],
  ["pwk", "PWK"],
  ["geologi", "Geologi"],
  ["lingkungan", "Lingkungan"],
  ["kelautan", "Kelautan"],
  ["bencana", "Kebencanaan"],
  ["multidisiplin", "Multidisiplin"],
];

function exceedsAgreement(medianValue, bawaan, ambang) {
  if (medianValue == null || bawaan == null) return false;
  if (!Number.isFinite(medianValue) || !Number.isFinite(bawaan)) return false;
  return Math.abs(medianValue - bawaan) >= ambang;
}

/**
 * @param {object} snapshot matriks[labelBahaya][labelDisiplin] = { bawaan, median, status }
 * @param {Record<string, Record<string, number>>} v0
 */
export function applyFrozenMedian(snapshot, v0) {
  if (!snapshot?.matriks || snapshot.ambang !== V1_META.ambang) {
    throw new Error("Snapshot V1 tidak memuat ambang 0,125.");
  }
  if (snapshot.n_jawaban !== V1_META.nValidator) {
    throw new Error("Snapshot V1 bukan agregat 24 validator.");
  }
  const weights = {};
  for (const hazard of Object.keys(v0)) {
    weights[hazard] = { ...v0[hazard] };
  }
  const changed = [];
  for (const [hazardId, hazardLabel] of V1_KEPT_HAZARDS) {
    const row = snapshot.matriks[hazardLabel];
    if (!row) throw new Error(`Snapshot V1 tidak memuat ${hazardLabel}.`);
    if (!weights[hazardId]) throw new Error(`V0 tidak memuat ${hazardId}.`);
    for (const [discId, discLabel] of DISCIPLINES) {
      const cell = row[discLabel];
      const bawaan = v0[hazardId][discId];
      if (!cell || typeof cell.bawaan !== "number" || typeof cell.median !== "number") {
        throw new Error(`Sel snapshot tidak lengkap: ${hazardLabel} × ${discLabel}.`);
      }
      if (cell.bawaan !== bawaan) {
        throw new Error(
          `Bawaan snapshot tidak sama dengan V0: ${hazardLabel} × ${discLabel} (${cell.bawaan} vs ${bawaan}).`,
        );
      }
      const replace = exceedsAgreement(cell.median, cell.bawaan, snapshot.ambang);
      const next = replace ? cell.median : cell.bawaan;
      weights[hazardId][discId] = next;
      if (next !== bawaan) {
        changed.push({
          hazard: hazardId,
          discipline: discId,
          hazardLabel,
          disciplineLabel: discLabel,
          bawaan,
          median: cell.median,
          status: cell.status,
        });
      }
    }
  }
  return { weights, changed };
}
