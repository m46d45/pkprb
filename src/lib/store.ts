import { create } from "zustand";
import type { DisciplineId, HazardId, ViewMode } from "@/lib/types";
import { ALL_DISCIPLINES_ON, cloneDefaultWeights } from "@/lib/weights";

type WeightMap = Record<HazardId, Record<DisciplineId, number>>;

type MapStore = {
  viewMode: ViewMode;
  hazard: HazardId;
  enabled: Record<DisciplineId, boolean>;
  weights: WeightMap;
  includeCenters: boolean;
  includeIabee: boolean;
  includeSpillover: boolean;
  selectedId: string | null;
  panelOpen: boolean;
  setViewMode: (v: ViewMode) => void;
  setHazard: (h: HazardId) => void;
  toggleDiscipline: (d: DisciplineId) => void;
  setWeight: (d: DisciplineId, v: number) => void;
  setIncludeCenters: (v: boolean) => void;
  setIncludeIabee: (v: boolean) => void;
  setIncludeSpillover: (v: boolean) => void;
  setSelectedId: (id: string | null) => void;
  setPanelOpen: (v: boolean) => void;
  resetWeights: () => void;
};

export const useMapStore = create<MapStore>((set) => ({
  viewMode: "keselarasan",
  hazard: "gempa",
  enabled: { ...ALL_DISCIPLINES_ON },
  weights: cloneDefaultWeights(),
  includeCenters: true,
  includeIabee: true,
  includeSpillover: true,
  selectedId: null,
  panelOpen: false,
  setViewMode: (viewMode) => set({ viewMode }),
  setHazard: (hazard) => set({ hazard }),
  toggleDiscipline: (d) =>
    set((s) => ({ enabled: { ...s.enabled, [d]: !s.enabled[d] } })),
  setWeight: (d, v) =>
    set((s) => ({
      weights: {
        ...s.weights,
        [s.hazard]: { ...s.weights[s.hazard], [d]: v },
      },
    })),
  setIncludeCenters: (includeCenters) => set({ includeCenters }),
  setIncludeIabee: (includeIabee) => set({ includeIabee }),
  setIncludeSpillover: (includeSpillover) => set({ includeSpillover }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  resetWeights: () =>
    set({
      weights: cloneDefaultWeights(),
      enabled: { ...ALL_DISCIPLINES_ON },
      includeCenters: true,
      includeIabee: true,
      includeSpillover: true,
    }),
}));
