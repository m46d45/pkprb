import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DISCIPLINES, HAZARDS, VIEW_MODES } from "@/lib/types";
import {
  DISCIPLINE_LABEL,
  HAZARD_LABEL,
  VIEW_LABEL,
} from "@/lib/weights";
import { useMapStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const hazard = useMapStore((s) => s.hazard);
  const viewMode = useMapStore((s) => s.viewMode);
  const enabled = useMapStore((s) => s.enabled);
  const weights = useMapStore((s) => s.weights);
  const includeCenters = useMapStore((s) => s.includeCenters);
  const includeIabee = useMapStore((s) => s.includeIabee);
  const includeSpillover = useMapStore((s) => s.includeSpillover);
  const setHazard = useMapStore((s) => s.setHazard);
  const setViewMode = useMapStore((s) => s.setViewMode);
  const toggleDiscipline = useMapStore((s) => s.toggleDiscipline);
  const setWeight = useMapStore((s) => s.setWeight);
  const setIncludeCenters = useMapStore((s) => s.setIncludeCenters);
  const setIncludeIabee = useMapStore((s) => s.setIncludeIabee);
  const setIncludeSpillover = useMapStore((s) => s.setIncludeSpillover);
  const resetWeights = useMapStore((s) => s.resetWeights);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
          Tampilan
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-paper p-1">
          {VIEW_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={cn(
                "h-9 rounded-md px-1 text-[11px] font-medium transition-colors",
                viewMode === m
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              {VIEW_LABEL[m]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
          Jenis bahaya
        </p>
        <div className="grid grid-cols-2 gap-1">
          {HAZARDS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHazard(h)}
              className={cn(
                "h-9 rounded-md border px-2 text-left text-[12px] transition-colors",
                hazard === h
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink hover:border-muted",
              )}
            >
              {HAZARD_LABEL[h]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
            Bobot prodi
          </p>
          <Button variant="ghost" size="sm" onClick={resetWeights}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <div className="space-y-3">
          {DISCIPLINES.map((d) => (
            <div key={d} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[13px]">
                  <Switch
                    checked={enabled[d]}
                    onCheckedChange={() => toggleDiscipline(d)}
                    aria-label={`Toggle ${DISCIPLINE_LABEL[d]}`}
                  />
                  {DISCIPLINE_LABEL[d]}
                </label>
                <span className="tabular-nums text-[12px] text-muted">
                  {enabled[d] ? weights[hazard][d].toFixed(2) : "off"}
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.05}
                disabled={!enabled[d]}
                value={[weights[hazard][d]]}
                onValueChange={([v]) => setWeight(d, v ?? 0)}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Bobot mengikuti jenis bahaya yang dipilih. Matriks default: sipil
          tinggi di gempa, PWK lebih tinggi di tsunami/banjir.
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
          Pengali mutu
        </p>
        <ToggleRow
          label="Pusat studi & PkM"
          checked={includeCenters}
          onChange={setIncludeCenters}
        />
        <ToggleRow
          label="Bonus IABEE"
          checked={includeIabee}
          onChange={setIncludeIabee}
        />
        <ToggleRow
          label="Spillover antarprovinsi"
          checked={includeSpillover}
          onChange={setIncludeSpillover}
        />
        <p className="text-[11px] leading-relaxed text-muted">
          IABEE hanya untuk prodi teknik. Spillover: kampus Unggul/IABEE dan
          pusat studi nasional menyumbang ke pulau yang sama.
        </p>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-[13px]">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
