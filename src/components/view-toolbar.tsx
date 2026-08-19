import { HAZARDS, VIEW_MODES } from "@/lib/types";
import { HAZARD_LABEL, VIEW_LABEL } from "@/lib/weights";
import { useMapStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ViewToolbar() {
  const viewMode = useMapStore((s) => s.viewMode);
  const hazard = useMapStore((s) => s.hazard);
  const setViewMode = useMapStore((s) => s.setViewMode);
  const setHazard = useMapStore((s) => s.setHazard);

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-line bg-surface px-4 py-2 lg:flex-row lg:items-center lg:gap-8">
      <div className="flex min-w-0 items-center gap-3">
        <p className="hidden shrink-0 text-[11px] font-medium tracking-wide text-muted uppercase sm:block">
          Tampilan
        </p>
        <div className="grid w-full max-w-sm grid-cols-3 gap-1 rounded-lg bg-paper p-1 sm:w-72">
          {VIEW_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={cn(
                "h-8 rounded-md px-1 text-[11px] font-medium transition-colors",
                viewMode === m
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              {VIEW_LABEL[m]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center">
        <p className="hidden shrink-0 text-[11px] font-medium tracking-wide text-muted uppercase sm:block">
          Bahaya
        </p>
        <div className="flex flex-wrap gap-1">
          {HAZARDS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHazard(h)}
              className={cn(
                "h-8 rounded-md border px-2.5 text-[11px] transition-colors",
                hazard === h
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink hover:border-muted",
              )}
            >
              {h === "composite" ? "Komposit" : HAZARD_LABEL[h]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
