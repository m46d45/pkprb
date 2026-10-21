import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  agregasiValidasi,
  defaultsFromWeightTables,
  median,
  statusSel,
} from "../src/lib/validasi-agregasi.mjs";

const defaults = {
  matriks: {
    Gempabumi: { Sipil: 1, Arsitektur: 0.55 },
    Tsunami: { Sipil: 0.7 },
  },
  jenjang: { s1: 1, s2: 1, s3: 1 },
  akreditasi: { acc_int: 1, acc_unggul: 0.9, acc_bs: 0.8, acc_baik: 0.7 },
};

test("median genap dan ganjil", () => {
  assert.equal(median([]), null);
  assert.equal(median([0.75]), 0.75);
  assert.equal(median([0.5, 0.55]), 0.525);
  assert.equal(median([0.25, 0.5, 1]), 0.5);
});

test("status memakai ambang ketat 0,125", () => {
  assert.equal(statusSel(0.55, 0.55), "setuju");
  assert.equal(statusSel(0.674, 0.55), "setuju");
  assert.equal(statusSel(0.675, 0.55), "usul naik");
  assert.equal(statusSel(0.425, 0.55), "usul turun");
  assert.equal(statusSel(null, 0.55), null);
});

test("sel matriks memisahkan setuju, tidak yakin, dan sel kosong", () => {
  const hasil = agregasiValidasi(
    [
      { matriks: { Gempabumi: { Sipil: 0.75, Arsitektur: "setuju" } } },
      { matriks: { Gempabumi: { Sipil: 0.75, Arsitektur: "tidak_yakin" } } },
      { matriks: { Gempabumi: { Sipil: "setuju" } } },
      { matriks: { Gempabumi: { Sipil: "tidak_yakin", Arsitektur: 0.25 } } },
      {},
    ],
    defaults,
  );
  assert.equal(hasil.n_jawaban, 5);
  const sipil = hasil.matriks.Gempabumi.Sipil;
  assert.equal(sipil.bawaan, 1);
  assert.equal(sipil.n, 4);
  assert.equal(sipil.n_setuju, 1);
  assert.equal(sipil.n_tidak_yakin, 1);
  assert.equal(sipil.median, 0.75);
  assert.equal(sipil.status, "usul turun");
  const arsitektur = hasil.matriks.Gempabumi.Arsitektur;
  assert.deepEqual(
    {
      n: arsitektur.n,
      n_setuju: arsitektur.n_setuju,
      n_tidak_yakin: arsitektur.n_tidak_yakin,
      median: arsitektur.median,
      status: arsitektur.status,
    },
    { n: 3, n_setuju: 1, n_tidak_yakin: 1, median: 0.4, status: "usul turun" },
  );
  assert.equal(hasil.matriks.Tsunami.Sipil.n, 0);
  assert.equal(hasil.matriks.Tsunami.Sipil.median, null);
  assert.equal(hasil.matriks.Tsunami.Sipil.status, null);
});

test("jenjang kosong dihitung setuju, pilihan dihitung", () => {
  const hasil = agregasiValidasi(
    [
      { s1: 0.5, a1: "mean", ahli: ["sipil", "geologi"], setuju_bukan_kesiapan: "on" },
      { s1: "", a1: "mean", ahli: "pwk", c1: "setuju" },
      { a1: "", ahli: [] },
    ],
    defaults,
  );
  assert.deepEqual(hasil.jenjang.s1, {
    label: "S1 / D4",
    bawaan: 1,
    n: 3,
    n_setuju: 2,
    n_angka: 1,
    median: 1,
    status: "setuju",
  });
  assert.equal(hasil.akreditasi.acc_unggul.bawaan, 0.9);
  assert.equal(hasil.akreditasi.acc_unggul.n_setuju, 3);
  assert.equal(hasil.akreditasi.acc_unggul.median, 0.9);
  assert.deepEqual(hasil.pilihan.a1.hitung, { mean: 2 });
  assert.equal(hasil.pilihan.a1.kosong, 1);
  assert.deepEqual(hasil.pilihan.ahli.hitung, { sipil: 1, geologi: 1, pwk: 1 });
  assert.equal(hasil.pilihan.ahli.kosong, 1);
  assert.equal(hasil.pilihan.c1.hitung.setuju, 1);
  assert.equal(hasil.pilihan.setuju_bukan_kesiapan.hitung.dicentang, 1);
  assert.equal(hasil.pilihan.setuju_bukan_kesiapan.kosong, 2);
});

test("agregasi publik tidak memuat identitas atau catatan", () => {
  const hasil = agregasiValidasi(
    [
      {
        nama: "Rahasia Orang",
        institusi: "Kampus Rahasia",
        email: "rahasia@example.com",
        peran: "peneliti rahasia",
        a1_alasan: "catatan bernama Rahasia Orang",
        g1: "ubah model rahasia",
        g2: "jangan ubah rahasia",
        g3: "catatan lain rahasia",
        matriks: { Gempabumi: { Sipil: "setuju" } },
        a1: "mean",
      },
    ],
    defaults,
  );
  const teks = JSON.stringify(hasil);
  for (const jejak of ["Rahasia Orang", "Kampus Rahasia", "rahasia@example.com", "peneliti rahasia", "catatan bernama", "ubah model", "jangan ubah", "catatan lain"]) {
    assert.equal(teks.includes(jejak), false, jejak);
  }
  assert.deepEqual(Object.keys(hasil).sort(), ["akreditasi", "ambang", "jenjang", "matriks", "n_jawaban", "pilihan"]);
});

test("nilai bawaan agregasi mengikuti tabel bobot peta", () => {
  const weights = {
    gempa: { sipil: 1, arsitektur: 0.55, pwk: 0.4, geologi: 0.9, lingkungan: 0.25, kelautan: 0.25, bencana: 0.85, multidisiplin: 0.7 },
    tsunami: { sipil: 0.7, arsitektur: 0.35, pwk: 0.8, geologi: 0.65, lingkungan: 0.4, kelautan: 0.9, bencana: 0.9, multidisiplin: 0.75 },
    banjir: { sipil: 0.85, arsitektur: 0.3, pwk: 0.85, geologi: 0.35, lingkungan: 0.75, kelautan: 0.35, bencana: 0.85, multidisiplin: 0.8 },
    longsor: { sipil: 0.9, arsitektur: 0.25, pwk: 0.55, geologi: 0.95, lingkungan: 0.4, kelautan: 0.15, bencana: 0.8, multidisiplin: 0.7 },
    likuefaksi: { sipil: 1, arsitektur: 0.25, pwk: 0.35, geologi: 0.9, lingkungan: 0.2, kelautan: 0.15, bencana: 0.7, multidisiplin: 0.55 },
    gunungapi: { sipil: 0.55, arsitektur: 0.3, pwk: 0.5, geologi: 0.95, lingkungan: 0.4, kelautan: 0.1, bencana: 0.85, multidisiplin: 0.7 },
    karhutla: { sipil: 0.25, arsitektur: 0.15, pwk: 0.45, geologi: 0.25, lingkungan: 0.7, kelautan: 0.05, bencana: 0.8, multidisiplin: 0.75 },
    composite: { sipil: 0.85, arsitektur: 0.4, pwk: 0.55, geologi: 0.7, lingkungan: 0.45, kelautan: 0.4, bencana: 0.85, multidisiplin: 0.8 },
  };
  const built = defaultsFromWeightTables(
    weights,
    { S1: 1, S2: 1, S3: 1 },
    { internasional: 1, unggul: 0.9, "baik-sekali": 0.8, baik: 0.7 },
  );
  assert.equal(built.matriks.Gempabumi.Sipil, 1);
  assert.equal(built.matriks.Tsunami.Kelautan, 0.9);
  assert.equal(built.matriks.Karhutla.Kelautan, 0.05);
  assert.equal(built.jenjang.s2, 1);
  assert.equal(built.akreditasi.acc_bs, 0.8);
  const src = readFileSync(new URL("../src/lib/weights.ts", import.meta.url), "utf8");
  assert.match(src, /gempa:\s*\{\s*\n\s*sipil: 1/);
  assert.match(src, /kelautan: 0\.05/);
});
