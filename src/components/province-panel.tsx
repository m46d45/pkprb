import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { centersIn, programsIn, prodiAccLevel, QUADRANT_LABEL } from "@/lib/scoring";
import type { ProvinceScore } from "@/lib/types";
import { ACC_LABEL, DISCIPLINE_LABEL, HAZARD_LABEL } from "@/lib/weights";
import { useMapStore } from "@/lib/store";
import { formatInt, formatNumber } from "@/lib/utils";
import { bivariateColor } from "@/lib/palette";
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
          style={{
            background: bivariateColor(score.riskClass, score.eduClass),
            color: score.riskClass + score.eduClass >= 3 ? "#f3eee4" : "#1f1a16",
          }}
        >
          {QUADRANT_LABEL[score.quadrant]}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Risiko" value={formatNumber(score.risk)} />
          <Stat label="Pendidikan" value={formatNumber(score.idpki)} />
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
            Prodi ({list.length})
          </h3>
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
