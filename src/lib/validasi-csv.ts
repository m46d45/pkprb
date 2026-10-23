/** Kolom bahaya dan disiplin — sama dengan formulir. Bukan bobot bawaan. */
export const HAZARDS = [
  "Gempabumi",
  "Tsunami",
  "Banjir",
  "Longsor",
  "Likuefaksi",
  "Gunung api",
  "Karhutla",
  "Komposit",
] as const;

export const DISCIPLINES = [
  "Sipil",
  "Arsitektur",
  "PWK",
  "Geologi",
  "Lingkungan",
  "Kelautan",
  "Kebencanaan",
  "Multidisiplin",
] as const;

const FLAT_FIELDS = [
  "form_rev",
  "client_id",
  "durasi_detik",
  "acara",
  "nama",
  "institusi",
  "peran",
  "ahli",
  "lihat_peta",
  "a1",
  "a1_alasan",
  "a2",
  "s1",
  "s2",
  "s3",
  "b1",
  "acc_int",
  "acc_unggul",
  "acc_bs",
  "acc_baik",
  "c1",
  "c2",
  "d1",
  "d2",
  "e1",
  "e2",
  "f1",
  "g1",
  "g2",
  "g3",
  "setuju_bukan_kesiapan",
  "setuju_ringkas",
  "setuju_institusi",
] as const;

const RESERVED = new Set<string>([
  "matriks",
  "ahli",
  "versi",
  "schema",
  "waktu",
  "fase",
  ...FLAT_FIELDS,
]);

export type ValidasiExportRow = {
  id: string;
  created_at: string | Date;
  versi: string | null;
  payload: unknown;
  /** `pilot` (uji coba, tidak masuk agregasi) atau `validasi`. */
  fase?: string | null;
};

function asPayload(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function iso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

function cell(value: unknown): string {
  if (value == null) return "";
  let text: string;
  if (typeof value === "string") text = value;
  else if (typeof value === "number" || typeof value === "boolean") text = String(value);
  else if (Array.isArray(value)) text = value.map((item) => String(item)).join(";");
  else text = JSON.stringify(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text) || text.includes(" ")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function ahliCell(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item)).join(";");
  if (typeof value === "string") return value;
  return "";
}

/** Angka, `setuju`, atau `tidak_yakin`. Sel yang tidak ada tetap sel kosong. */
function matrixValue(
  payload: Record<string, unknown>,
  hazard: string,
  discipline: string,
): unknown {
  const matrix = payload.matriks;
  if (!matrix || typeof matrix !== "object" || Array.isArray(matrix)) return "";
  const row = (matrix as Record<string, unknown>)[hazard];
  if (!row || typeof row !== "object" || Array.isArray(row)) return "";
  const value = (row as Record<string, unknown>)[discipline];
  return value == null ? "" : value;
}

function extraScalarKeys(rows: Record<string, unknown>[]): string[] {
  const found = new Set<string>();
  for (const payload of rows) {
    for (const key of Object.keys(payload)) {
      if (RESERVED.has(key)) continue;
      const value = payload[key];
      if (value != null && typeof value === "object") continue;
      found.add(key);
    }
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

function extraMatrixColumns(rows: Record<string, unknown>[]): string[] {
  const known = new Set(HAZARDS.flatMap((hazard) => DISCIPLINES.map((d) => `${hazard}\0${d}`)));
  const found = new Set<string>();
  for (const payload of rows) {
    const matrix = payload.matriks;
    if (!matrix || typeof matrix !== "object" || Array.isArray(matrix)) continue;
    for (const [hazard, cells] of Object.entries(matrix as Record<string, unknown>)) {
      if (!cells || typeof cells !== "object" || Array.isArray(cells)) continue;
      for (const discipline of Object.keys(cells as Record<string, unknown>)) {
        const id = `${hazard}\0${discipline}`;
        if (!known.has(id)) found.add(id);
      }
    }
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

export function buildValidasiCsv(rows: ValidasiExportRow[]): string {
  const payloads = rows.map((row) => asPayload(row.payload));
  const extras = extraScalarKeys(payloads);
  const extraMatrix = extraMatrixColumns(payloads);
  const matrixHeaders = [
    ...HAZARDS.flatMap((hazard) => DISCIPLINES.map((discipline) => `m_${hazard}_${discipline}`)),
    ...extraMatrix.map((id) => {
      const [hazard, discipline] = id.split("\0");
      return `m_${hazard}_${discipline}`;
    }),
  ];
  const headers = [
    "id",
    "fase",
    "waktu",
    "created_at",
    "versi",
    "schema",
    ...FLAT_FIELDS,
    ...extras,
    ...matrixHeaders,
  ];

  const lines = [headers.map(cell).join(",")];
  rows.forEach((row, index) => {
    const payload = payloads[index] ?? {};
    const waktu =
      typeof payload.waktu === "string" && payload.waktu ? payload.waktu : iso(row.created_at);
    const values: unknown[] = [
      row.id,
      row.fase ?? "",
      waktu,
      iso(row.created_at),
      row.versi ?? (typeof payload.versi === "string" ? payload.versi : ""),
      payload.schema ?? "",
    ];
    for (const key of FLAT_FIELDS) {
      values.push(key === "ahli" ? ahliCell(payload.ahli) : (payload[key] ?? ""));
    }
    for (const key of extras) values.push(payload[key] ?? "");
    for (const hazard of HAZARDS) {
      for (const discipline of DISCIPLINES) {
        values.push(matrixValue(payload, hazard, discipline));
      }
    }
    for (const id of extraMatrix) {
      const [hazard, discipline] = id.split("\0");
      values.push(matrixValue(payload, hazard, discipline));
    }
    lines.push(values.map(cell).join(","));
  });
  return lines.join("\r\n") + "\r\n";
}
