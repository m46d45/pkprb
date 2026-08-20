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
    label: "Keselarasan",
    modes: ["risiko", "idpki", "keselarasan"],
  },
  {
    id: "respons",
    label: "Roadmap",
    modes: ["historis", "pusat", "respons"],
  },
];

export function ViewToolbar() {
  const viewMode = useMapStore((s) => s.viewMode);
  const hazard = useMapStore((s) => s.hazard);
  const setViewMode = useMapStore((s) => s.setViewMode);
  const setHazard = useMapStore((s) => s.setHazard);

  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-line bg-surface px-4 py-2.5 xl:flex-row xl:items-stretch xl:gap-0">
      {/* —— Tampilan (mode peta) —— */}
      <div className="flex min-w-0 flex-col gap-1.5 xl:pr-5">
        <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Tampilan
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {VIEW_GROUPS.map((group, gi) => (
            <div key={group.id} className="flex items-center gap-2">
              {gi > 0 && (
                <div
                  className="hidden h-7 w-px shrink-0 bg-line sm:block"
                  aria-hidden
                />
              )}
              <div className="flex items-center gap-1.5">
                <span className="hidden text-[10px] text-muted/80 sm:inline">
                  {group.label}
                </span>
                <div className="flex flex-wrap gap-0.5 rounded-lg bg-paper p-0.5">
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
      </div>

      {/* Pemisah vertikal (hanya layar lebar) */}
      <div
        className="hidden w-px shrink-0 self-stretch bg-line xl:block"
        aria-hidden
      />

      {/* —— Filter jenis bahaya —— */}
      <div className="flex min-w-0 flex-col gap-1.5 xl:flex-1 xl:pl-5">
        <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Jenis bahaya
        </p>
        <div className="flex flex-wrap gap-1">
          {HAZARDS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHazard(h)}
              className={cn(
                "h-8 rounded-full border px-2.5 text-[11px] transition-colors",
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
