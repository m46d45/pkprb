import { writeFileSync } from "node:fs";
import { MAP_HAZARDS } from "@/lib/types";
import { scoreProvinces } from "@/lib/scoring";
import { V1_WEIGHTS, V2_WEIGHTS } from "@/lib/weight-versions";
import {
  DEFAULT_ACC,
  DEFAULT_CENTER_WEIGHT,
  DEFAULT_KEPAKARAN_WEIGHT,
  DEFAULT_SPILLOVER_WEIGHT,
  DEFAULT_STRATA,
  DEFAULT_WEIGHTS,
} from "@/lib/weights";

const base = {
  strataWeights: DEFAULT_STRATA,
  accWeights: DEFAULT_ACC,
  centerWeight: DEFAULT_CENTER_WEIGHT,
  kepakaranWeight: DEFAULT_KEPAKARAN_WEIGHT,
  spilloverWeight: DEFAULT_SPILLOVER_WEIGHT,
};

const weights = {
  v0: DEFAULT_WEIGHTS,
  v1: V1_WEIGHTS,
  v2: V2_WEIGHTS,
} as const;

const out: Record<string, Record<string, Record<string, string>>> = {};
for (const hazard of MAP_HAZARDS) {
  out[hazard] = {};
  for (const version of ["v0", "v1", "v2"] as const) {
    const rows = scoreProvinces({ hazard, weights: weights[version][hazard], ...base });
    out[hazard][version] = Object.fromEntries(rows.map((row) => [row.provinceId, row.quadrant]));
  }
}

const target = process.argv[2] ?? "/tmp/kuadran.json";
writeFileSync(target, JSON.stringify(out));
console.log(target);
