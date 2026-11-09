/**
 * Bandingkan label Keselarasan V0, V1, dan V2 pada bobot beku.
 * Parameter lain memakai nilai bawaan peta.
 * V0 vs V1 tetap daftar yang sudah dicek. V2 dilaporkan, tidak diubah rumus pancaran.
 */
import { createServer } from "vite";

const expected = {
  gempa: [],
  tsunami: ["kepri", "kalbar"],
  banjir: [],
  longsor: ["ntt"],
  likuefaksi: [],
  composite: [],
};

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const scoring = await server.ssrLoadModule("/src/lib/scoring.ts");
  const weights = await server.ssrLoadModule("/src/lib/weights.ts");
  const versions = await server.ssrLoadModule("/src/lib/weight-versions.ts");
  const institutions = await server.ssrLoadModule("/src/lib/institutions.ts");

  const base = {
    strataWeights: weights.DEFAULT_STRATA,
    accWeights: weights.DEFAULT_ACC,
    centerWeight: weights.DEFAULT_CENTER_WEIGHT,
    kepakaranWeight: weights.DEFAULT_KEPAKARAN_WEIGHT,
    spilloverWeight: weights.DEFAULT_SPILLOVER_WEIGHT,
  };

  let failed = false;
  const changedVsV0 = new Set();
  const changedVsV1 = new Set();
  for (const hazard of Object.keys(expected)) {
    const v0 = scoring.scoreProvinces({
      hazard,
      weights: weights.DEFAULT_WEIGHTS[hazard],
      ...base,
    });
    const v1 = scoring.scoreProvinces({
      hazard,
      weights: versions.V1_WEIGHTS[hazard],
      ...base,
    });
    const v2 = scoring.scoreProvinces({
      hazard,
      weights: versions.V2_WEIGHTS[hazard],
      ...base,
    });
    const byV1 = new Map(v1.map((row) => [row.provinceId, row]));
    const byV2 = new Map(v2.map((row) => [row.provinceId, row]));
    const flips = v0
      .filter((row) => byV1.get(row.provinceId).quadrant !== row.quadrant)
      .map((row) => ({
        id: row.provinceId,
        v0: row.quadrant,
        v1: byV1.get(row.provinceId).quadrant,
      }));
    const ids = flips.map((row) => row.id).sort();
    const want = [...expected[hazard]].sort();
    const ok = ids.join(",") === want.join(",");
    if (!ok) failed = true;
    const v2vs0 = v0.filter((row) => byV2.get(row.provinceId).quadrant !== row.quadrant);
    const v2vs1 = v1.filter((row) => byV2.get(row.provinceId).quadrant !== row.quadrant);
    for (const row of v2vs0) changedVsV0.add(`${hazard}:${row.provinceId}`);
    for (const row of v2vs1) changedVsV1.add(`${hazard}:${row.provinceId}`);
    console.log(
      `${ok ? "ok" : "BEDA"} ${hazard} V0/V1: ${flips.map((row) => `${row.id} ${row.v0}->${row.v1}`).join(", ") || "(tidak ada)"}`,
    );
    console.log(
      `  V2 vs V0 (${v2vs0.length}): ${v2vs0.map((row) => `${row.provinceId} ${row.quadrant}->${byV2.get(row.provinceId).quadrant}`).join(", ") || "(tidak ada)"}`,
    );
    console.log(
      `  V2 vs V1 (${v2vs1.length}): ${v2vs1.map((row) => `${row.provinceId} ${row.quadrant}->${byV2.get(row.provinceId).quadrant}`).join(", ") || "(tidak ada)"}`,
    );
    const dotsA = institutions.institutionPoints(hazard);
    const dotsB = institutions.institutionPoints(hazard);
    if (JSON.stringify(dotsA) !== JSON.stringify(dotsB)) failed = true;
    if (dotsA.some((dot) => "score" in dot || "idpki" in dot || dot.name.toLowerCase().includes("dosen"))) {
      failed = true;
    }
  }
  console.log(`V2 berubah dibanding V0: ${changedVsV0.size} pasangan bahaya×provinsi`);
  console.log(`V2 berubah dibanding V1: ${changedVsV1.size} pasangan bahaya×provinsi`);
  if (versions.V1_CHANGED.length !== 12) {
    console.log(`BEDA jumlah sel V1: ${versions.V1_CHANGED.length}`);
    failed = true;
  }
  if (failed) process.exitCode = 1;
} finally {
  await server.close();
}
