import { create } from "zustand";
import type { WeightVersion } from "@/lib/weight-versions";
import { cloneVersionWeights } from "@/lib/weight-versions";
import type { AccLevel, DisciplineId, HazardId, StrataLevel, ViewMode } from "@/lib/types";
import {
  DEFAULT_ACC,
  DEFAULT_CENTER_WEIGHT,
  DEFAULT_KEPAKARAN_WEIGHT,
  DEFAULT_SPILLOVER_WEIGHT,
  DEFAULT_STRATA,
} from "@/lib/weights";

type WeightMap = Record<HazardId, Record<DisciplineId, number>>;

type MapStore = {
  viewMode: ViewMode;
  hazard: HazardId;
  weightVersion: WeightVersion;
  weights: WeightMap;
  strataWeights: Record<StrataLevel, number>;
  accWeights: Record<AccLevel, number>;
  centerWeight: number;
  kepakaranWeight: number;
  spilloverWeight: number;
  selectedId: string | null;
  selectedInstitutionId: string | null;
  selectedPlace: string | null;
  panelOpen: boolean;
  setViewMode: (v: ViewMode) => void;
  setHazard: (h: HazardId) => void;
  setWeightVersion: (v: WeightVersion) => void;
  setWeight: (d: DisciplineId, v: number) => void;
  setStrataWeight: (s: StrataLevel, v: number) => void;
  setAccWeight: (a: AccLevel, v: number) => void;
  setCenterWeight: (v: number) => void;
  setKepakaranWeight: (v: number) => void;
  setSpilloverWeight: (v: number) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedInstitutionId: (id: string | null) => void;
  setSelectedPlace: (key: string | null) => void;
  setPanelOpen: (v: boolean) => void;
  resetWeights: () => void;
};

const resetSlice = (weightVersion: WeightVersion) => ({
  weightVersion,
  weights: cloneVersionWeights(weightVersion),
  strataWeights: { ...DEFAULT_STRATA },
  accWeights: { ...DEFAULT_ACC },
  centerWeight: DEFAULT_CENTER_WEIGHT,
  kepakaranWeight: DEFAULT_KEPAKARAN_WEIGHT,
  spilloverWeight: DEFAULT_SPILLOVER_WEIGHT,
});

export const useMapStore = create<MapStore>((set) => ({
  viewMode: "keselarasan",
  hazard: "gempa",
  selectedId: null,
  selectedInstitutionId: null,
  selectedPlace: null,
  panelOpen: false,
  ...resetSlice("v0"),
  setViewMode: (viewMode) => set({ viewMode }),
  setHazard: (hazard) => set({ hazard }),
  setWeightVersion: (weightVersion) =>
    set({ weightVersion, weights: cloneVersionWeights(weightVersion) }),
  setWeight: (d, v) =>
    set((s) => ({
      weights: {
        ...s.weights,
        [s.hazard]: { ...s.weights[s.hazard], [d]: v },
      },
    })),
  setStrataWeight: (k, v) =>
    set((s) => ({ strataWeights: { ...s.strataWeights, [k]: v } })),
  setAccWeight: (k, v) =>
    set((s) => ({ accWeights: { ...s.accWeights, [k]: v } })),
  setCenterWeight: (centerWeight) => set({ centerWeight }),
  setKepakaranWeight: (kepakaranWeight) => set({ kepakaranWeight }),
  setSpilloverWeight: (spilloverWeight) => set({ spilloverWeight }),
  setSelectedId: (selectedId) =>
    set(
      selectedId
        ? { selectedId, selectedInstitutionId: null, selectedPlace: null }
        : { selectedId },
    ),
  setSelectedInstitutionId: (selectedInstitutionId) =>
    set(
      selectedInstitutionId
        ? { selectedInstitutionId, selectedId: null }
        : { selectedInstitutionId },
    ),
  setSelectedPlace: (selectedPlace) =>
    set(
      selectedPlace
        ? { selectedPlace, selectedInstitutionId: null, selectedId: null }
        : { selectedPlace, selectedInstitutionId: null },
    ),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  resetWeights: () => set((s) => resetSlice(s.weightVersion)),
}));
