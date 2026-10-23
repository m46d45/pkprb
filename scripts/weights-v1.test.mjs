import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applyFrozenMedian, V1_KEPT_HAZARDS, V1_META } from "../src/lib/weights-v1.mjs";

const snapshot = JSON.parse(
  readFileSync(new URL("../src/data/v1-beku-20261023.json", import.meta.url), "utf8"),
);

const HAZARD_TO_ID = Object.fromEntries(V1_KEPT_HAZARDS.map(([id, label]) => [label, id]));
HAZARD_TO_ID["Gunung api"] = "gunungapi";
HAZARD_TO_ID.Karhutla = "karhutla";

const DISC_TO_ID = {
  Sipil: "sipil",
  Arsitektur: "arsitektur",
  PWK: "pwk",
  Geologi: "geologi",
  Lingkungan: "lingkungan",
  Kelautan: "kelautan",
  Kebencanaan: "bencana",
  Multidisiplin: "multidisiplin",
};

function v0FromSnapshot(data) {
  const weights = {};
  for (const [label, row] of Object.entries(data.matriks)) {
    const hazardId = HAZARD_TO_ID[label];
    weights[hazardId] = {};
    for (const [discLabel, cell] of Object.entries(row)) {
      weights[hazardId][DISC_TO_ID[discLabel]] = cell.bawaan;
    }
  }
  return weights;
}

const EXPECTED = [
  ["gempa", "lingkungan", 0.25, 0.5],
  ["gempa", "kelautan", 0.25, 0.375],
  ["gempa", "bencana", 0.85, 1],
  ["tsunami", "arsitektur", 0.35, 0.5],
  ["tsunami", "multidisiplin", 0.75, 0.875],
  ["banjir", "geologi", 0.35, 0.5],
  ["banjir", "kelautan", 0.35, 0.5],
  ["longsor", "arsitektur", 0.25, 0.5],
  ["longsor", "kelautan", 0.15, 0.5],
  ["likuefaksi", "pwk", 0.35, 0.5],
  ["likuefaksi", "lingkungan", 0.2, 0.35],
  ["likuefaksi", "multidisiplin", 0.55, 0.75],
];

test("metadata beku V1", () => {
  assert.equal(snapshot.n_jawaban, 24);
  assert.equal(snapshot.ambang, 0.125);
  assert.equal(V1_META.nValidator, 24);
  assert.equal(V1_META.ambang, 0.125);
  assert.equal(V1_META.frozenAt, "2026-10-23T17:02:00+07:00");
  assert.match(V1_META.label, /24 validator/);
  assert.match(V1_META.label, /23 Okt 2026 17\.02 WIB/);
  assert.deepEqual(
    V1_KEPT_HAZARDS.map(([id]) => id),
    ["composite", "gempa", "tsunami", "banjir", "longsor", "likuefaksi"],
  );
});

test("V1 hanya mengganti 12 sel yang lolos ambang pada lima bahaya", () => {
  const { weights, changed } = applyFrozenMedian(snapshot, v0FromSnapshot(snapshot));
  assert.equal(changed.length, 12);
  const got = changed.map((c) => [c.hazard, c.discipline, c.bawaan, c.median]);
  assert.deepEqual(got, EXPECTED);
  for (const [hazard, discipline, bawaan, median] of EXPECTED) {
    assert.equal(weights[hazard][discipline], median);
    assert.notEqual(median, bawaan);
  }
  assert.equal(weights.gempa.pwk, 0.4);
  assert.equal(weights.gempa.multidisiplin, 0.7);
  assert.equal(weights.composite.arsitektur, 0.4);
  assert.equal(weights.gunungapi.bencana, 0.85);
  assert.equal(weights.karhutla.kelautan, 0.05);
  for (const hazard of ["composite", "gempa", "tsunami", "banjir", "longsor", "likuefaksi", "gunungapi", "karhutla"]) {
    for (const discipline of Object.keys(weights[hazard])) {
      const expected = EXPECTED.find((row) => row[0] === hazard && row[1] === discipline);
      if (!expected) assert.equal(weights[hazard][discipline], v0FromSnapshot(snapshot)[hazard][discipline]);
    }
  }
});

test("filter peta tidak memuat gunung api dan karhutla", () => {
  const types = readFileSync(new URL("../src/lib/types.ts", import.meta.url), "utf8");
  assert.match(types, /gunungapi/);
  assert.match(types, /karhutla/);
  const mapBlock = types.slice(types.indexOf("export const MAP_HAZARDS"));
  assert.match(mapBlock, /"gempa"/);
  assert.match(mapBlock, /"tsunami"/);
  assert.match(mapBlock, /"banjir"/);
  assert.match(mapBlock, /"longsor"/);
  assert.match(mapBlock, /"likuefaksi"/);
  assert.match(mapBlock, /"composite"/);
  assert.doesNotMatch(mapBlock.slice(0, mapBlock.indexOf("export type MapHazardId")), /gunungapi|karhutla/);
  const toolbar = readFileSync(new URL("../src/components/view-toolbar.tsx", import.meta.url), "utf8");
  assert.match(toolbar, /MAP_HAZARDS\.map/);
  assert.doesNotMatch(toolbar, /\{HAZARDS\.map/);
});

test("halaman metodologi dan rekap menyebut cakupan lima bahaya", () => {
  const page = readFileSync(new URL("../src/routes/metodologi.tsx", import.meta.url), "utf8");
  const frozen = readFileSync(new URL("../src/lib/weights-v1.mjs", import.meta.url), "utf8");
  assert.match(page, /V0 dan V1/);
  assert.match(page, /V1_META\.frozenLabel/);
  assert.match(frozen, /23 Okt 2026 17\.02 WIB/);
  assert.match(page, /ambang/);
  assert.match(page, /tidak ada di filter|tidak dipakai sebagai filter/);
  const html = readFileSync(new URL("../public/validasi-hasil.html", import.meta.url), "utf8");
  assert.match(html, /Gunung api dan karhutla tetap ditampilkan/);
  assert.match(html, /tidak dipakai pada filter peta/);
  const hasil = readFileSync(new URL("../src/routes/validasi.hasil.tsx", import.meta.url), "utf8");
  assert.match(hasil, /tidak dipakai pada filter peta/);
});
