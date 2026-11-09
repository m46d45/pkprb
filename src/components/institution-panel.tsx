import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CENTER_TIER_LABEL,
  INSTITUTION_DISCLAIMER,
  PROGRAM_TIER_LABEL,
  institutionLines,
  programLineLabel,
  type InstitutionPoint,
} from "@/lib/institutions";
import { BIVARIATE } from "@/lib/palette";
import { DISCIPLINE_LABEL } from "@/lib/weights";
import { useMapStore } from "@/lib/store";
import { formatInt } from "@/lib/utils";

export function InstitutionPanel({ points }: { points: InstitutionPoint[] }) {
  const hazard = useMapStore((s) => s.hazard);
  const focusId = useMapStore((s) => s.selectedInstitutionId);
  const setSelectedInstitutionId = useMapStore((s) => s.setSelectedInstitutionId);
  const setSelectedPlace = useMapStore((s) => s.setSelectedPlace);
  const focus = points.find((point) => point.id === focusId) ?? null;
  if (!focus && points.length > 1) {
    const place = points[0];
    return (
      <aside className="flex h-full flex-col bg-surface">
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
          <div>
            <p className="text-[11px] tracking-wide text-muted uppercase">Koordinat kota</p>
            <h2 className="font-display text-2xl leading-tight">{place?.city}</h2>
            <p className="mt-1 text-[12px] text-muted">
              {place?.province} · {points.length} institusi pada koordinat yang sama
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tutup"
            onClick={() => setSelectedPlace(null)}
          >
            <X className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <p className="text-[12px] leading-relaxed text-muted">{INSTITUTION_DISCLAIMER}</p>
          <ul className="space-y-2">
            {[...points]
              .sort((a, b) => a.name.localeCompare(b.name, "id"))
              .map((point) => (
                <li key={point.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2 text-left hover:border-ink"
                    onClick={() => setSelectedInstitutionId(point.id)}
                  >
                    <i
                      className="size-3 shrink-0 rounded-full border border-line"
                      style={{ background: point.color }}
                    />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium">{point.name}</span>
                      <span className="block text-[12px] text-muted">
                        {point.programs === 0
                          ? "data prodi belum lengkap"
                          : `${formatInt(point.programs)} program studi`}
                        {" · "}
                        {point.centers > 0 ? "ada pusat studi" : "tidak ada pusat studi"}
                      </span>
                      {point.programs === 0 ? null : (
                        <span className="mt-1 block whitespace-pre-line text-[12px] leading-snug text-ink">
                          {institutionLines(hazard, point.name)
                            .programLines.map((item) => programLineLabel(item))
                            .join("\n")}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </aside>
    );
  }
  const point = focus ?? points[0];
  if (!point) return null;
  return <InstitutionDetail point={point} many={points.length > 1} />;
}

function InstitutionDetail({ point, many }: { point: InstitutionPoint; many: boolean }) {
  const hazard = useMapStore((s) => s.hazard);
  const setSelectedInstitutionId = useMapStore((s) => s.setSelectedInstitutionId);
  const setSelectedPlace = useMapStore((s) => s.setSelectedPlace);
  const { programLines, centerLines } = institutionLines(hazard, point.name);
  const ink = point.programClass + point.centerClass >= 3 ? "#f3eee4" : "#1f1a16";

  return (
    <aside className="flex h-full flex-col bg-surface">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
        <div>
          <p className="text-[11px] tracking-wide text-muted uppercase">Institusi</p>
          <h2 className="font-display text-2xl leading-tight">{point.name}</h2>
          <p className="mt-1 text-[12px] text-muted">
            {point.city} · {point.province}
          </p>
        </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tutup"
            onClick={() => setSelectedPlace(null)}
          >
            <X className="size-4" />
          </Button>
        </header>
        {many ? (
          <button
            type="button"
            className="border-b border-line px-4 py-2 text-left text-[13px] text-muted hover:text-ink"
            onClick={() => setSelectedInstitutionId(null)}
          >
            ← Semua institusi di {point.city}
          </button>
        ) : null}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="rounded-lg px-3 py-2 text-sm" style={{ background: point.color, color: ink }}>
          Prodi {PROGRAM_TIER_LABEL[point.programClass]}, {CENTER_TIER_LABEL[point.centerClass]}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-paper px-3 py-2">
            <dt className="text-[11px] text-muted">Program studi relevan</dt>
            <dd className="font-display text-xl tabular-nums">{formatInt(point.programs)}</dd>
          </div>
          <div className="rounded-lg bg-paper px-3 py-2">
            <dt className="text-[11px] text-muted">Pusat studi relevan</dt>
            <dd className="font-display text-xl tabular-nums">{formatInt(point.centers)}</dd>
          </div>
        </dl>
        <p className="text-[12px] leading-relaxed text-muted">{INSTITUTION_DISCLAIMER}</p>
        <p className="text-[12px] leading-relaxed text-muted">
          Warna titik memakai matriks 3×3 yang sama dengan peta. Tegak: pusat studi
          (tanpa, satu, lebih dari satu). Datar: program studi (sedikit, sedang, banyak).
          Ini bukan skor individu.
        </p>
        <div className="grid w-fit grid-cols-3 gap-px" aria-hidden>
          {[2, 1, 0].map((row) =>
            [0, 1, 2].map((col) => (
              <div
                key={`${row}-${col}`}
                className="size-4"
                style={{
                  background: BIVARIATE[row][col],
                  outline:
                    row === point.centerClass && col === point.programClass
                      ? "2px solid #1f1a16"
                      : undefined,
                  outlineOffset: "1px",
                }}
              />
            )),
          )}
        </div>

        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
            Program studi ({programLines.length})
          </h3>
          <ul className="space-y-2">
            {programLines.length === 0 && (
              <li className="text-sm text-muted">Tidak ada prodi pada inventaris ini.</li>
            )}
            {programLines.map((item) => (
              <li key={item.id} className="border-b border-line pb-2 text-[13px]">
                <p className="font-medium">{item.program}</p>
                <p className="text-muted">
                  {item.strata} · {DISCIPLINE_LABEL[item.discipline]}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
            Pusat studi ({centerLines.length})
          </h3>
          <ul className="space-y-2">
            {centerLines.length === 0 && (
              <li className="text-sm text-muted">Tidak ada pusat yang cocok dengan filter bahaya ini.</li>
            )}
            {centerLines.map((item) => (
              <li key={item.id} className="border-b border-line pb-2 text-[13px]">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted">{item.focus}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
