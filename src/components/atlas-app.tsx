import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { MapView } from "@/components/map-view";
import { ControlPanel } from "@/components/control-panel";
import { BivariateLegend } from "@/components/bivariate-legend";
import { RampLegend } from "@/components/ramp-legend";
import { ProvincePanel } from "@/components/province-panel";
import { Button } from "@/components/ui/button";
import { scoreProvinces, getProvince } from "@/lib/scoring";
import { EDU_CAP, EDU_RAMP, RISK_RAMP, riskCap } from "@/lib/palette";
import { useMapStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AtlasApp() {
  const viewMode = useMapStore((s) => s.viewMode);
  const hazard = useMapStore((s) => s.hazard);
  const weights = useMapStore((s) => s.weights);
  const strataWeights = useMapStore((s) => s.strataWeights);
  const accWeights = useMapStore((s) => s.accWeights);
  const centerWeight = useMapStore((s) => s.centerWeight);
  const kepakaranWeight = useMapStore((s) => s.kepakaranWeight);
  const spilloverWeight = useMapStore((s) => s.spilloverWeight);
  const selectedId = useMapStore((s) => s.selectedId);
  const panelOpen = useMapStore((s) => s.panelOpen);
  const setPanelOpen = useMapStore((s) => s.setPanelOpen);
  const setSelectedId = useMapStore((s) => s.setSelectedId);

  const scores = useMemo(
    () =>
      scoreProvinces({
        hazard,
        weights: weights[hazard],
        strataWeights,
        accWeights,
        centerWeight,
        kepakaranWeight,
        spilloverWeight,
      }),
    [
      hazard,
      weights,
      strataWeights,
      accWeights,
      centerWeight,
      kepakaranWeight,
      spilloverWeight,
    ],
  );

  const selected = scores.find((s) => s.provinceId === selectedId) ?? null;
  const gaps = [...scores].sort((a, b) => b.gap - a.gap).slice(0, 6);

  return (
    <div className="flex h-dvh max-w-[100vw] flex-col overflow-hidden bg-paper text-ink">
      <Header />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-20 w-[min(100%,22rem)] overflow-y-auto border-r border-line bg-surface/95 p-4 backdrop-blur-sm transition-transform duration-200 lg:static lg:w-80 lg:translate-x-0 lg:bg-surface",
            panelOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="font-display text-lg">Parameter</p>
            <Button variant="ghost" size="icon" onClick={() => setPanelOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <ControlPanel />
        </aside>

        <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="absolute inset-0">
            <MapView scores={scores} />
          </div>
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start">
            <Button
              variant="secondary"
              size="sm"
              className="pointer-events-auto shadow-sm lg:hidden"
              onClick={() => setPanelOpen(true)}
            >
              <SlidersHorizontal className="size-3.5" />
              Parameter
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 z-10 max-w-sm rounded-lg border border-line bg-surface/95 p-3 shadow-sm">
            {viewMode === "keselarasan" ? (
              <BivariateLegend />
            ) : viewMode === "risiko" ? (
              <RampLegend
                title="Risiko"
                max={riskCap(hazard)}
                unit={
                  hazard === "composite"
                    ? "skor IRBI, 0–200"
                    : "skor bahaya, 0–100"
                }
                ramp={RISK_RAMP}
              />
            ) : (
              <RampLegend
                title="Pendidikan"
                max={EDU_CAP}
                unit="indeks per juta penduduk, 0–15"
                ramp={EDU_RAMP}
              />
            )}
          </div>
        </main>

        <div
          className={cn(
            "absolute inset-y-0 right-0 z-20 w-[min(100%,24rem)] overflow-hidden border-l border-line bg-surface shadow-sm transition-transform duration-200",
            selected ? "translate-x-0" : "translate-x-full pointer-events-none",
          )}
        >
          {selected ? <ProvincePanel score={selected} /> : null}
        </div>
      </div>

      <footer className="hidden max-w-full overflow-hidden border-t border-line bg-surface md:block">
        <div className="flex items-center gap-4 overflow-x-auto px-4 py-2 text-[12px]">
          <span className="shrink-0 font-medium text-muted">
            Prioritas senjang
          </span>
          {gaps.map((g, i) => {
            const p = getProvince(g.provinceId);
            return (
              <button
                key={g.provinceId}
                type="button"
                onClick={() => setSelectedId(g.provinceId)}
                className="shrink-0 rounded-md border border-line px-2 py-1 hover:border-ink"
              >
                {i + 1}. {p?.name} · {formatNumber(g.gap)}
              </button>
            );
          })}
          <span className="ml-auto hidden shrink-0 text-muted lg:block">
            Senjang dihitung dari risiko − pendidikan (ternormalisasi).
          </span>
        </div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
      <Link to="/" className="flex items-baseline gap-2 no-underline">
        <span className="font-display text-xl tracking-tight">PKPRB</span>
        <span className="hidden text-[12px] text-muted sm:inline">
          Peta Keselarasan Pendidikan dan Risiko Bencana
        </span>
      </Link>
      <nav className="ml-auto flex items-center gap-3 text-[13px]">
        <Link
          to="/metodologi"
          className="rounded-md border border-line px-3 py-1.5 hover:border-ink"
        >
          Metodologi
        </Link>
      </nav>
    </header>
  );
}
