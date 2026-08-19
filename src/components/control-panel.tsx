import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ACC_LEVELS, DISCIPLINES, HAZARDS, STRATA_LEVELS, VIEW_MODES } from "@/lib/types";
import {
  ACC_LABEL,
  DISCIPLINE_LABEL,
  HAZARD_LABEL,
  STRATA_LABEL,
  VIEW_LABEL,
} from "@/lib/weights";
import { useMapStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const hazard = useMapStore((s) => s.hazard);
  const viewMode = useMapStore((s) => s.viewMode);
  const weights = useMapStore((s) => s.weights);
  const strataWeights = useMapStore((s) => s.strataWeights);
  const accWeights = useMapStore((s) => s.accWeights);
  const centerWeight = useMapStore((s) => s.centerWeight);
  const kepakaranWeight = useMapStore((s) => s.kepakaranWeight);
  const spilloverWeight = useMapStore((s) => s.spilloverWeight);
  const setHazard = useMapStore((s) => s.setHazard);
  const setViewMode = useMapStore((s) => s.setViewMode);
  const setWeight = useMapStore((s) => s.setWeight);
  const setStrataWeight = useMapStore((s) => s.setStrataWeight);
  const setAccWeight = useMapStore((s) => s.setAccWeight);
  const setCenterWeight = useMapStore((s) => s.setCenterWeight);
  const setKepakaranWeight = useMapStore((s) => s.setKepakaranWeight);
  const setSpilloverWeight = useMapStore((s) => s.setSpilloverWeight);
  const resetWeights = useMapStore((s) => s.resetWeights);

  return (
    <div className="flex flex-col gap-7">
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
            Pendidikan
          </p>
          <Button variant="ghost" size="sm" onClick={resetWeights}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <p className="mb-2 text-[11px] text-muted">Prodi</p>
        <div className="space-y-3">
          {DISCIPLINES.map((d) => (
            <WeightRow
              key={d}
              label={DISCIPLINE_LABEL[d]}
              value={weights[hazard][d]}
              onChange={(v) => setWeight(d, v)}
            />
          ))}
        </div>
        <p className="mt-5 mb-2 text-[11px] text-muted">Jenjang</p>
        <div className="space-y-3">
          {STRATA_LEVELS.map((s) => (
            <WeightRow
              key={s}
              label={STRATA_LABEL[s]}
              value={strataWeights[s]}
              onChange={(v) => setStrataWeight(s, v)}
            />
          ))}
        </div>
        <p className="mt-5 mb-2 text-[11px] text-muted">Akreditasi prodi</p>
        <div className="space-y-3">
          {ACC_LEVELS.map((a) => (
            <WeightRow
              key={a}
              label={ACC_LABEL[a]}
              value={accWeights[a]}
              onChange={(v) => setAccWeight(a, v)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-medium tracking-wide text-muted uppercase">
          Penelitian
        </p>
        <WeightRow
          label="Keberadaan pusat studi"
          value={centerWeight}
          onChange={setCenterWeight}
        />
      </section>

      <section>
        <p className="mb-3 text-[11px] font-medium tracking-wide text-muted uppercase">
          Pengabdian masyarakat
        </p>
        <WeightRow
          label="Keberadaan layanan kepakaran"
          value={kepakaranWeight}
          onChange={setKepakaranWeight}
        />
      </section>

      <section>
        <p className="mb-3 text-[11px] font-medium tracking-wide text-muted uppercase">
          Spillover
        </p>
        <WeightRow
          label="Spillover antarprovinsi"
          value={spilloverWeight}
          onChange={setSpilloverWeight}
        />
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Mengikuti akreditasi perguruan tinggi, bukan prodi. Institusi
          internasional memancar lebih jauh daripada Unggul; Baik tetap lokal.
        </p>
      </section>
    </div>
  );
}

function WeightRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={cn("space-y-1.5", value <= 0 && "opacity-45")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px]">{label}</span>
        <span className="tabular-nums text-[12px] text-muted">
          {value.toFixed(2)}
        </span>
      </div>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={[value]}
        onValueChange={([v]) => onChange(v ?? 0)}
      />
    </div>
  );
}
