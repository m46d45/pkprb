/**
 * Bandingkan label Keselarasan V0 dan V1 pada bobot beku.
 * Parameter lain memakai nilai bawaan peta.
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

  const base = {
    strataWeights: weights.DEFAULT_STRATA,
    accWeights: weights.DEFAULT_ACC,
    centerWeight: weights.DEFAULT_CENTER_WEIGHT,
    kepakaranWeight: weights.DEFAULT_KEPAKARAN_WEIGHT,
    spilloverWeight: weights.DEFAULT_SPILLOVER_WEIGHT,
  };

  let failed = false;
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
    const byV1 = new Map(v1.map((row) => [row.provinceId, row]));
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
    console.log(
      `${ok ? "ok" : "BEDA"} ${hazard}: ${flips.map((row) => `${row.id} ${row.v0}->${row.v1}`).join(", ") || "(tidak ada)"}`,
    );
  }
  if (versions.V1_CHANGED.length !== 12) {
    console.log(`BEDA jumlah sel V1: ${versions.V1_CHANGED.length}`);
    failed = true;
  }
  if (failed) process.exitCode = 1;
} finally {
  await server.close();
}
