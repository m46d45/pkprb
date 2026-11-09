import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { deriveV2, upliftV2, V2_DISCIPLINES } from "../src/lib/weights-v2.mjs";

test("batas kenaikan V2", () => {
  assert.equal(upliftV2(0.399), 0.524);
  assert.equal(upliftV2(0.4), 0.5);
  assert.equal(upliftV2(0.6), 0.7);
  assert.equal(upliftV2(0.601), 0.651);
  assert.equal(upliftV2(0.96), 1);
  assert.equal(upliftV2(1), 1);
});

test("V2 hanya menaikkan enam disiplin non-sipil", () => {
  const v1 = {
    gempa: {
      sipil: 1,
      arsitektur: 0.55,
      pwk: 0.5,
      geologi: 0.9,
      lingkungan: 0.5,
      kelautan: 0.375,
      bencana: 1,
      multidisiplin: 0.7,
    },
  };
  const v2 = deriveV2(v1);
  assert.equal(v2.gempa.sipil, 1);
  assert.equal(v2.gempa.bencana, 1);
  assert.equal(v2.gempa.arsitektur, 0.65);
  assert.equal(v2.gempa.pwk, 0.6);
  assert.equal(v2.gempa.geologi, 0.95);
  assert.equal(v2.gempa.lingkungan, 0.6);
  assert.equal(v2.gempa.kelautan, 0.5);
  assert.equal(v2.gempa.multidisiplin, 0.75);
  assert.deepEqual(V2_DISCIPLINES, [
    "arsitektur",
    "pwk",
    "geologi",
    "lingkungan",
    "kelautan",
    "multidisiplin",
  ]);
});

test("setiap kota inventaris punya koordinat dan lapisan tidak memuat skor", () => {
  const coords = JSON.parse(
    readFileSync(new URL("../src/data/city-coordinates.json", import.meta.url), "utf8"),
  );
  const programs = readFileSync(new URL("../src/data/programs.ts", import.meta.url), "utf8");
  const cities = new Set([...programs.matchAll(/"city": "([^"]+)"/g)].map((m) => m[1]));
  for (const city of cities) {
    assert.ok(coords[city], `koordinat hilang: ${city}`);
    assert.equal(coords[city].length, 2);
  }
  const seen = new Map();
  for (const city of cities) {
    const key = coords[city].join(",");
    const other = seen.get(key);
    assert.equal(other, undefined, `${city} menumpuk di koordinat ${other}`);
    seen.set(key, city);
  }
  assert.deepEqual(coords["Kota Bandung"], [107.619, -6.917]);
  const layer = readFileSync(new URL("../src/lib/institutions.ts", import.meta.url), "utf8");
  assert.match(layer, /indicative only — not an individual assessment/);
  assert.doesNotMatch(layer, /weightVersion|idpki|skor/);
  const canvas = readFileSync(new URL("../src/components/map-canvas.tsx", import.meta.url), "utf8");
  assert.match(canvas, /INSTITUTION_ZOOM_K/);
  assert.doesNotMatch(canvas, /prodi · /);
  assert.match(
    readFileSync(new URL("../src/components/institution-panel.tsx", import.meta.url), "utf8"),
    /Program studi relevan/,
  );
  assert.doesNotMatch(canvas, /dosen/);
  assert.doesNotMatch(canvas, /sensitif/i);
  assert.doesNotMatch(
    readFileSync(new URL("../src/components/view-toolbar.tsx", import.meta.url), "utf8"),
    /sensitif/i,
  );
  assert.doesNotMatch(
    readFileSync(new URL("../src/components/atlas-app.tsx", import.meta.url), "utf8"),
    /sensitif/i,
  );
  assert.doesNotMatch(
    readFileSync(new URL("../src/components/province-panel.tsx", import.meta.url), "utf8"),
    /sensitif/i,
  );
  const metodologi = readFileSync(
    new URL("../src/routes/metodologi.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(metodologi, /204 prodi/);
  assert.match(
    metodologi,
    /Provinsi yang labelnya berubah antara V1 \(tervalidasi\) dan V2 \(penyesuaian peneliti\)\./,
  );
});
