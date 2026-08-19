import { create } from "zustand";
import type { AccLevel, DisciplineId, HazardId, StrataLevel, ViewMode } from "@/lib/types";
import {
  cloneDefaultWeights,
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
  weights: WeightMap;
  strataWeights: Record<StrataLevel, number>;
  accWeights: Record<AccLevel, number>;
  centerWeight: number;
  kepakaranWeight: number;
  spilloverWeight: number;
  selectedId: string | null;
  panelOpen: boolean;
  setViewMode: (v: ViewMode) => void;
  setHazard: (h: HazardId) => void;
  setWeight: (d: DisciplineId, v: number) => void;
  setStrataWeight: (s: StrataLevel, v: number) => void;
  setAccWeight: (a: AccLevel, v: number) => void;
  setCenterWeight: (v: number) => void;
  setKepakaranWeight: (v: number) => void;
  setSpilloverWeight: (v: number) => void;
  setSelectedId: (id: string | null) => void;
  setPanelOpen: (v: boolean) => void;
  resetWeights: () => void;
};

const resetSlice = () => ({
  weights: cloneDefaultWeights(),
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
  panelOpen: false,
  ...resetSlice(),
  setViewMode: (viewMode) => set({ viewMode }),
  setHazard: (hazard) => set({ hazard }),
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
  setSelectedId: (selectedId) => set({ selectedId }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  resetWeights: () => set(resetSlice()),
}));
