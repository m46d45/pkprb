/**
 * Agregasi jawaban kuesioner. Tidak mengubah bobot peta.
 * Aturan lengkap: docs/metodologi-agregasi.md
 */

const HAZARDS = [
  "Gempabumi",
  "Tsunami",
  "Banjir",
  "Longsor",
  "Likuefaksi",
  "Gunung api",
  "Karhutla",
  "Komposit",
];

const DISCIPLINES = [
  "Sipil",
  "Arsitektur",
  "PWK",
  "Geologi",
  "Lingkungan",
  "Kelautan",
  "Kebencanaan",
  "Multidisiplin",
];

const HAZARD_TO_WEIGHT = {
  Gempabumi: "gempa",
  Tsunami: "tsunami",
  Banjir: "banjir",
  Longsor: "longsor",
  Likuefaksi: "likuefaksi",
  "Gunung api": "gunungapi",
  Karhutla: "karhutla",
  Komposit: "composite",
};

const DISC_TO_WEIGHT = {
  Sipil: "sipil",
  Arsitektur: "arsitektur",
  PWK: "pwk",
  Geologi: "geologi",
  Lingkungan: "lingkungan",
  Kelautan: "kelautan",
  Kebencanaan: "bencana",
  Multidisiplin: "multidisiplin",
};

const JENJANG = [
  ["s1", "S1 / D4", "S1"],
  ["s2", "S2", "S2"],
  ["s3", "S3", "S3"],
];

const AKREDITASI = [
  ["acc_int", "Internasional / IABEE GA", "internasional"],
  ["acc_unggul", "Unggul / A", "unggul"],
  ["acc_bs", "Baik Sekali / B", "baik-sekali"],
  ["acc_baik", "Baik / C", "baik"],
];

const PILIHAN = [
  ["lihat_peta", "Pernah membuka peta?"],
  ["a1", "A1. Cara merangkum skor kabupaten"],
  ["a2", "A2. Provinsi tidak muncul di tabel IRBI"],
  ["b1", "B1. Bobot jenjang proporsional"],
  ["c1", "C1. IABEE GA disetarakan dengan Internasional"],
  ["c2", "C2. Prodi tanpa peringkat terbit"],
  ["d1", "D1. Kepakaran dari tanda PkM"],
  ["d2", "D2. Provinsi tanpa pusat studi"],
  ["e1", "E1. Pancaran ke provinsi lain"],
  ["e2", "E2. Cara membagi pancaran"],
  ["f1", "F1. Kesan terhadap nilai bawaan"],
];

const CENTANG = [
  ["setuju_bukan_kesiapan", "Memahami PKPRB bukan peta kesiapan"],
  ["setuju_ringkas", "Boleh dipakai menyesuaikan bobot"],
  ["setuju_institusi", "Nama institusi boleh dicantumkan"],
];

const AMBANG = 0.125;

function round6(n) {
  return Math.round(n * 1e6) / 1e6;
}

export function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const raw =
    sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return round6(raw);
}

export function statusSel(medianValue, bawaan) {
  if (medianValue == null || bawaan == null || !Number.isFinite(bawaan)) return null;
  const selisih = medianValue - bawaan;
  if (Math.abs(selisih) < AMBANG) return "setuju";
  return selisih > 0 ? "usul naik" : "usul turun";
}

function asRecord(raw) {
  if (typeof raw === "string") {
    try {
      return asRecord(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  return null;
}

function angka01(raw) {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0 && raw <= 1) return raw;
  if (typeof raw === "string") {
    const n = Number(raw.trim().replace(",", "."));
    if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
  }
  return null;
}

function kosong(raw) {
  return raw == null || raw === "";
}

function cellOf(payload, hazard, discipline) {
  const matrix = payload.matriks;
  if (!matrix || typeof matrix !== "object" || Array.isArray(matrix)) return undefined;
  const row = matrix[hazard];
  if (!row || typeof row !== "object" || Array.isArray(row)) return undefined;
  return row[discipline];
}

function agregatSel(payloads, bawaan, hazard, discipline) {
  const skor = [];
  let nSetuju = 0;
  let nTidakYakin = 0;
  let n = 0;
  for (const payload of payloads) {
    const raw = cellOf(payload, hazard, discipline);
    if (kosong(raw)) continue;
    if (raw === "setuju") {
      n += 1;
      nSetuju += 1;
      if (bawaan != null) skor.push(bawaan);
      continue;
    }
    if (raw === "tidak_yakin") {
      n += 1;
      nTidakYakin += 1;
      continue;
    }
    const nomer = angka01(raw);
    if (nomer == null) continue;
    n += 1;
    skor.push(nomer);
  }
  const nilaiMedian = median(skor);
  return {
    bawaan,
    n,
    n_setuju: nSetuju,
    n_tidak_yakin: nTidakYakin,
    median: nilaiMedian,
    status: statusSel(nilaiMedian, bawaan),
  };
}

function agregatFaktor(payloads, bawaan, key) {
  const skor = [];
  let nSetuju = 0;
  let nAngka = 0;
  for (const payload of payloads) {
    const raw = payload[key];
    if (kosong(raw)) {
      nSetuju += 1;
      if (bawaan != null) skor.push(bawaan);
      continue;
    }
    const nomer = angka01(raw);
    if (nomer == null) continue;
    nAngka += 1;
    skor.push(nomer);
  }
  const nilaiMedian = median(skor);
  return {
    bawaan,
    n: nSetuju + nAngka,
    n_setuju: nSetuju,
    n_angka: nAngka,
    median: nilaiMedian,
    status: statusSel(nilaiMedian, bawaan),
  };
}

function tallyPilihan(payloads, key) {
  const hitung = {};
  let kosongN = 0;
  for (const payload of payloads) {
    const raw = payload[key];
    if (kosong(raw)) {
      kosongN += 1;
      continue;
    }
    const label = String(raw);
    hitung[label] = (hitung[label] ?? 0) + 1;
  }
  return { n: payloads.length, kosong: kosongN, hitung };
}

function dicentang(raw) {
  return raw === true || raw === "on" || raw === "true" || raw === "ya" || raw === 1;
}

function tallyCentang(payloads, key) {
  let n = 0;
  for (const payload of payloads) {
    if (dicentang(payload[key])) n += 1;
  }
  return {
    n: payloads.length,
    kosong: payloads.length - n,
    hitung: { dicentang: n },
  };
}

function tallyAhli(payloads) {
  const hitung = {};
  let kosongN = 0;
  for (const payload of payloads) {
    const raw = payload.ahli;
    const list = Array.isArray(raw) ? raw : typeof raw === "string" && raw ? raw.split(";") : [];
    const chosen = list.map((item) => String(item).trim()).filter(Boolean);
    if (chosen.length === 0) {
      kosongN += 1;
      continue;
    }
    for (const item of chosen) hitung[item] = (hitung[item] ?? 0) + 1;
  }
  return { n: payloads.length, kosong: kosongN, hitung };
}

export function defaultsFromWeightTables(weights, strata, acc) {
  const matriks = {};
  for (const hazard of HAZARDS) {
    const weightHazard = HAZARD_TO_WEIGHT[hazard];
    matriks[hazard] = {};
    for (const discipline of DISCIPLINES) {
      const weightDisc = DISC_TO_WEIGHT[discipline];
      matriks[hazard][discipline] = weights?.[weightHazard]?.[weightDisc] ?? null;
    }
  }
  return {
    matriks,
    jenjang: {
      s1: strata?.S1 ?? null,
      s2: strata?.S2 ?? null,
      s3: strata?.S3 ?? null,
    },
    akreditasi: {
      acc_int: acc?.internasional ?? null,
      acc_unggul: acc?.unggul ?? null,
      acc_bs: acc?.["baik-sekali"] ?? null,
      acc_baik: acc?.baik ?? null,
    },
  };
}

export function agregasiValidasi(rows, defaults) {
  const payloads = (rows ?? []).map(asRecord).filter(Boolean);
  const matriks = {};
  for (const hazard of HAZARDS) {
    matriks[hazard] = {};
    for (const discipline of DISCIPLINES) {
      const bawaan = defaults?.matriks?.[hazard]?.[discipline] ?? null;
      matriks[hazard][discipline] = agregatSel(payloads, bawaan, hazard, discipline);
    }
  }
  const jenjang = {};
  for (const [key, label] of JENJANG) {
    jenjang[key] = {
      label,
      ...agregatFaktor(payloads, defaults?.jenjang?.[key] ?? null, key),
    };
  }
  const akreditasi = {};
  for (const [key, label] of AKREDITASI) {
    akreditasi[key] = {
      label,
      ...agregatFaktor(payloads, defaults?.akreditasi?.[key] ?? null, key),
    };
  }
  const pilihan = { ahli: { label: "Keahlian", ...tallyAhli(payloads) } };
  for (const [key, label] of PILIHAN) {
    pilihan[key] = { label, ...tallyPilihan(payloads, key) };
  }
  for (const [key, label] of CENTANG) {
    pilihan[key] = { label, ...tallyCentang(payloads, key) };
  }
  return {
    n_jawaban: payloads.length,
    ambang: AMBANG,
    matriks,
    jenjang,
    akreditasi,
    pilihan,
  };
}
