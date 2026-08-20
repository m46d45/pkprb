import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { centersIn, eventsIn, programsIn, prodiAccLevel, QUADRANT_LABEL, RESPONS_LABEL } from "@/lib/scoring";
import type { ProvinceScore } from "@/lib/types";
import { ACC_LABEL, DISCIPLINE_LABEL, HAZARD_LABEL } from "@/lib/weights";
import { useMapStore } from "@/lib/store";
import { formatInt, formatNumber } from "@/lib/utils";
import { bivariateColor, EDU_CAP, PUSAT_CAP, responsColor, riskCap, toScale10 } from "@/lib/palette";
import { getProvince } from "@/lib/scoring";
import { ptAccreditation } from "@/data/universities";

export function ProvincePanel({
  score,
}: {
  score: ProvinceScore;
}) {
  const hazard = useMapStore((s) => s.hazard);
  const weights = useMapStore((s) => s.weights);
  const strataWeights = useMapStore((s) => s.strataWeights);
  const accWeights = useMapStore((s) => s.accWeights);
  const centerWeight = useMapStore((s) => s.centerWeight);
  const kepakaranWeight = useMapStore((s) => s.kepakaranWeight);
  const spilloverWeight = useMapStore((s) => s.spilloverWeight);
  const viewMode = useMapStore((s) => s.viewMode);
  const setSelectedId = useMapStore((s) => s.setSelectedId);
  const p = getProvince(score.provinceId);
  if (!p) return null;

  const list = programsIn(p.name, {
    hazard,
    weights: weights[hazard],
    strataWeights,
    accWeights,
    centerWeight,
    kepakaranWeight,
    spilloverWeight,
  });
  const cs = centersIn(p.name);
  const ev = eventsIn(p.name, hazard);

  return (
    <aside className="flex h-full flex-col bg-surface">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
        <div>
          <p className="text-[11px] tracking-wide text-muted uppercase">
            {HAZARD_LABEL[hazard]}
          </p>
          <h2 className="font-display text-2xl leading-tight">{p.name}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Tutup"
          onClick={() => setSelectedId(null)}
        >
          <X className="size-4" />
        </Button>
      </header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={
            viewMode === "respons" || viewMode === "historis" || viewMode === "pusat"
              ? {
                  background: responsColor(
                    score.historisClass,
                    score.pusatClass,
                    score.riskClass,
                  ),
                  color:
                    score.historisClass + score.pusatClass >= 1 || score.riskClass === 2
                      ? "#f3eee4"
                      : "#1f1a16",
                }
              : {
                  background: bivariateColor(score.riskClass, score.eduClass),
                  color: score.riskClass + score.eduClass >= 3 ? "#f3eee4" : "#1f1a16",
                }
          }
        >
          {viewMode === "respons" || viewMode === "historis" || viewMode === "pusat"
            ? RESPONS_LABEL[score.respons]
            : QUADRANT_LABEL[score.quadrant]}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="Risiko (1–10)"
            value={formatNumber(toScale10(score.risk, riskCap(hazard)))}
          />
          <Stat
            label="Pendidikan (1–10)"
            value={formatNumber(toScale10(score.idpki, EDU_CAP))}
          />
          <Stat
            label="Pusat (1–10)"
            value={formatNumber(toScale10(Math.log(1 + score.pusat), PUSAT_CAP))}
          />
          <Stat label="Korban sejak 2000" value={formatInt(score.deaths)} />
          <Stat label="Per juta" value={formatNumber(score.perJuta)} />
          <Stat label="Kapasitas" value={formatNumber(score.capacity)} />
          <Stat
            label={hazard === "composite" ? "IRBI (mentah)" : "Bahaya (mentah)"}
            value={formatNumber(score.risk)}
          />
          <Stat label="Penduduk" value={formatInt(p.population)} />
          <Stat
            label="Senjang (norm)"
            value={formatNumber(score.gap)}
          />
          <Stat label="Prodi" value={formatNumber(score.education)} />
          <Stat label="Penelitian" value={formatNumber(score.research)} />
          <Stat label="Pengabdian" value={formatNumber(score.service)} />
          <Stat
            label="Spillover masuk"
            value={formatNumber(score.spillover)}
          />
        </dl>
        <p className="text-[11px] leading-relaxed text-muted">{p.riskNote}</p>

        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
            Kejadian signifikan 2000–kini ({ev.length})
          </h3>
          <ul className="space-y-2">
            {ev.length === 0 && (
              <li className="text-sm text-muted">
                Tidak ada dalam katalog prototipe (bukan berarti nol kejadian DIBI).
              </li>
            )}
            {ev.map((e) => (
              <li key={e.id} className="border-b border-line pb-2 text-[13px]">
                <p className="font-medium">
                  {e.year} · {e.name}
                </p>
                <p className="text-muted">
                  {formatInt(e.deaths)} korban jiwa · {e.source}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <ul className="space-y-2">
            {list.length === 0 && (
              <li className="text-sm text-muted">Tidak ada prodi aktif pada filter ini.</li>
            )}
            {list.map((pr) => (
              <li key={pr.id} className="border-b border-line pb-2 text-[13px]">
                <p className="font-medium">{pr.university}</p>
                <p className="text-muted">
                  {pr.program} · {pr.strata} · {DISCIPLINE_LABEL[pr.discipline]}
                </p>
                <p className="text-[11px] text-muted">
                  {ACC_LABEL[prodiAccLevel(pr)]}
                  {` · PT ${ACC_LABEL[ptAccreditation(pr.university)]}`}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
            Pusat studi ({cs.length})
          </h3>
          <ul className="space-y-2">
            {cs.length === 0 && (
              <li className="text-sm text-muted">Belum teridentifikasi pada basis data ini.</li>
            )}
            {cs.map((c) => (
              <li key={c.id} className="border-b border-line pb-2 text-[13px]">
                <p className="font-medium">{c.name}</p>
                <p className="text-muted">{c.focus}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-paper px-3 py-2">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="font-display text-xl tabular-nums">{value}</dd>
    </div>
  );
}
