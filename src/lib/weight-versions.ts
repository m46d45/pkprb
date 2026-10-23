import snapshot from "@/data/v1-beku-20261023.json";
import type { DisciplineId, HazardId } from "@/lib/types";
import { HAZARDS } from "@/lib/types";
import { applyFrozenMedian, V1_META } from "@/lib/weights-v1.mjs";
import { DEFAULT_WEIGHTS } from "@/lib/weights";

export type WeightVersion = "v0" | "v1";

export { V1_META };

const derived = applyFrozenMedian(
  snapshot,
  DEFAULT_WEIGHTS as Record<string, Record<string, number>>,
);

export const V1_WEIGHTS = derived.weights as Record<
  HazardId,
  Record<DisciplineId, number>
>;

export const V1_CHANGED = derived.changed;

export const WEIGHT_VERSION_LABEL: Record<WeightVersion, string> = {
  v0: "V0 Bawaan",
  v1: V1_META.shortLabel,
};

export function cloneVersionWeights(version: WeightVersion) {
  const src = version === "v1" ? V1_WEIGHTS : DEFAULT_WEIGHTS;
  const out = {} as Record<HazardId, Record<DisciplineId, number>>;
  for (const hazard of HAZARDS) {
    out[hazard] = { ...src[hazard] };
  }
  return out;
}
