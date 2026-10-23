import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { buildValidasiCsv } from "../src/lib/validasi-csv.ts";
import {
  BATAS_VALIDASI_ISO,
  BATAS_VALIDASI_SQL,
  FASE_PILOT,
  FASE_VALIDASI,
  faseDariWaktu,
  hitungFase,
} from "../src/lib/validasi-fase.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const SAAT_PILOT = [
  "2026-09-20T11:17:47.967Z",
  "2026-09-22T00:08:54.445Z",
  "2026-09-29T06:13:38.179Z",
  "2026-10-10T02:47:08.052Z",
  "2026-10-19T06:11:19.218Z",
  "2026-10-22T16:59:59.999Z",
];

test("batas waktu memisahkan pilot dan validasi", () => {
  assert.equal(Date.parse(BATAS_VALIDASI_ISO), Date.parse("2026-10-22T17:00:00.000Z"));
  for (const saat of SAAT_PILOT) assert.equal(faseDariWaktu(saat), FASE_PILOT, saat);
  assert.equal(faseDariWaktu("2026-10-22T17:00:00.000Z"), FASE_VALIDASI);
  assert.equal(faseDariWaktu("2026-10-23T00:00:00.000Z"), FASE_VALIDASI);
  assert.equal(faseDariWaktu(new Date("2026-10-23T06:30:00.000Z")), FASE_VALIDASI);
  assert.equal(hitungFase("pilot", "2026-10-23T06:30:00.000Z"), FASE_PILOT);
  assert.equal(hitungFase("validasi", SAAT_PILOT[0]), FASE_VALIDASI);
  assert.equal(hitungFase(null, SAAT_PILOT[4]), FASE_PILOT);
  assert.equal(hitungFase("lain", "2026-10-23T00:00:00.000Z"), FASE_VALIDASI);
});

test("migrasi dan rute memakai batas yang sama", () => {
  const sql = read("migrations/0004_validasi_fase.sql");
  assert.match(sql, new RegExp(BATAS_VALIDASI_SQL.replaceAll("+", "\\+")));
  assert.match(sql, /then 'pilot'/);
  assert.match(sql, /else 'validasi'/);
  assert.match(sql, /set default 'validasi'/);
  assert.match(sql, /where fase is null/);
  assert.match(sql, /check \(fase in \('pilot', 'validasi'\)\)/);
  const route = read("src/routes/api/validasi.ts");
  assert.match(route, /r\.fase === FASE_VALIDASI/);
  assert.match(route, /FASE_VALIDASI/);
  assert.doesNotMatch(route, /select payload from validasi_jawaban order by created_at asc/);
  const html = read("public/validasi-hasil.html");
  assert.match(html, /n_pilot/);
  assert.match(html, /tidak dihitung/);
  const halaman = read("src/routes/validasi.hasil.tsx");
  assert.match(halaman, /jumlah_pilot/);
  assert.match(halaman, /fase === "pilot"/);
  const migrator = read("scripts/migrate.mjs");
  assert.match(migrator, /vercelEnv !== "production"/);
});

test("csv menandai fase dan tidak menggandakan kolom", () => {
  const csv = buildValidasiCsv([
    {
      id: "a",
      created_at: SAAT_PILOT[0],
      versi: "cek",
      fase: "pilot",
      payload: { nama: "Orang Pilot", fase: "validasi", institusi: "Kampus" },
    },
    {
      id: "b",
      created_at: "2026-10-23T02:00:00.000Z",
      versi: "2026-10-23-konteks20",
      fase: "validasi",
      payload: { nama: "Orang Validasi" },
    },
  ]);
  const lines = csv.trim().split(/\r\n/);
  const headers = lines[0].split(",");
  assert.equal(headers[0], "id");
  assert.equal(headers[1], "fase");
  assert.equal(headers.filter((h) => h === "fase").length, 1);
  assert.match(lines[1], /^a,pilot,/);
  assert.match(lines[2], /^b,validasi,/);
  assert.match(csv, /Orang Pilot/);
  assert.match(csv, /Orang Validasi/);
});

test("migrasi menandai saat sebelum batas sebagai pilot dan menyisakan validasi", async () => {
  const pg = new PGlite();
  await pg.waitReady;
  for (const name of ["0002_validasi.sql", "0003_validasi_client_id.sql"]) {
    await pg.exec(read(join("migrations", name)));
  }
  const sebelum = await pg.query(
    `select 1 as ok from information_schema.columns
     where table_schema = 'public' and table_name = 'validasi_jawaban' and column_name = 'fase'`,
  );
  assert.equal(sebelum.rows.length, 0);

  for (const [i, saat] of SAAT_PILOT.entries()) {
    await pg.query(
      `insert into validasi_jawaban (id, created_at, versi, nama, institusi, payload)
       values ($1, $2, 'cek', $3, 'uji', '{}')`,
      [`p${i}`, saat, `pilot-${i}`],
    );
  }
  await pg.query(
    `insert into validasi_jawaban (id, created_at, versi, nama, institusi, payload)
     values ('batas', $1, 'workshop', 'pada-batas', 'uji', '{}')`,
    ["2026-10-22T17:00:00.000Z"],
  );

  await pg.exec(read("migrations/0004_validasi_fase.sql"));

  const ada = await pg.query(
    `select 1 as ok from information_schema.columns
     where table_schema = 'public' and table_name = 'validasi_jawaban' and column_name = 'fase'`,
  );
  assert.equal(ada.rows.length, 1);

  const rows = await pg.query(`select id, fase from validasi_jawaban order by created_at asc`);
  assert.equal(rows.rows.length, SAAT_PILOT.length + 1);
  for (const row of rows.rows) {
    assert.equal(row.fase, row.id === "batas" ? "validasi" : "pilot", row.id);
  }

  await pg.query(
    `insert into validasi_jawaban (id, versi, nama, institusi, payload)
     values ('baru', 'workshop', 'UJI-AGEN', 'uji', '{}')`,
  );
  const baru = await pg.query(`select fase from validasi_jawaban where id = 'baru'`);
  assert.equal(baru.rows[0].fase, "validasi");

  const tetap = await pg.query(
    `select count(*)::int as n from validasi_jawaban where fase = 'pilot'`,
  );
  assert.equal(Number(tetap.rows[0].n), SAAT_PILOT.length);
});
