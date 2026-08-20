import { HAZARDS, type ViewMode } from "@/lib/types";
import { HAZARD_LABEL, VIEW_LABEL } from "@/lib/weights";
import { useMapStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Dua kelompok tampilan: keselarasan (bahaya × kapasitas) vs roadmap respons. */
const VIEW_GROUPS: {
  id: string;
  label: string;
  modes: ViewMode[];
}[] = [
  {
    id: "kapasitas",
    label: "Bahaya & Kapasitas",
    modes: ["risiko", "idpki", "keselarasan"],
  },
  {
    id: "respons",
    label: "Historis & Respons",
    modes: ["historis", "pusat", "respons"],
  },
];

export function ViewToolbar() {
  const viewMode = useMapStore((s) => s.viewMode);
  const hazard = useMapStore((s) => s.hazard);
  const setViewMode = useMapStore((s) => s.setViewMode);
  const setHazard = useMapStore((s) => s.setHazard);

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-line bg-surface px-4 py-2 lg:flex-row lg:items-center lg:gap-8">
      {/* Kelompok tampilan */}
      <div className="flex min-w-0 flex-wrap items-end gap-3">
        {VIEW_GROUPS.map((group, gi) => (
          <div key={group.id} className="flex items-end gap-3">
            {gi > 0 && (
              <div
                className="hidden h-8 w-px shrink-0 bg-line sm:block"
                aria-hidden
              />
            )}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1 rounded-lg bg-paper p-1">
                {group.modes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setViewMode(m)}
                    className={cn(
                      "h-8 rounded-md px-2.5 text-[11px] font-medium transition-colors",
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
          </div>
        ))}
      </div>

      {/* Filter bahaya (tetap global) */}
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
