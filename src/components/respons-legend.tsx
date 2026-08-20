import { RESPONS, responsColor } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function ResponsLegend({ className }: { className?: string }) {
  return (
    <div className={cn("select-none", className)}>
      <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
        Legenda
      </p>
      <div className="flex gap-1.5">
        <span
          className="flex h-[3.6rem] items-center justify-center text-[10px] tracking-wide text-muted uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Historis
        </span>
        <div>
          <div className="grid grid-cols-2 gap-px">
            {[1, 0].map((h) =>
              [0, 1].map((p) => (
                <div
                  key={`${h}-${p}`}
                  className="size-7"
                  style={{ background: RESPONS[h][p] }}
                />
              )),
            )}
          </div>
          <p className="mt-1.5 text-center text-[10px] tracking-wide text-muted uppercase">
            Pusat
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-[11px] text-muted">
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: RESPONS[1][1] }} />
          Responsif
        </li>
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: RESPONS[0][1] }} />
          Antisipatif
        </li>
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: RESPONS[1][0] }} />
          Tidak melembaga
        </li>
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: RESPONS[0][0] }} />
          Belum terespons
        </li>
        <li className="flex items-center gap-2">
          <i
            className="size-2.5"
            style={{ background: responsColor(0, 0, 2) }}
          />
          Belum terespons + risiko tinggi
        </li>
      </ul>
    </div>
  );
}
