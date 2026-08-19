import { BIVARIATE } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function BivariateLegend({ className }: { className?: string }) {
  return (
    <div className={cn("select-none", className)}>
      <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
        Matriks 3×3
      </p>
      <div className="flex items-end gap-2">
        <span
          className="origin-bottom pb-6 text-[10px] tracking-wide text-muted uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Risiko
        </span>
        <div>
          <div className="grid grid-cols-3 gap-px">
            {[2, 1, 0].map((r) =>
              [0, 1, 2].map((e) => (
                <div
                  key={`${r}-${e}`}
                  className="size-7"
                  style={{ background: BIVARIATE[r][e] }}
                  title={`Risiko ${r + 1}, IDPKI ${e + 1}`}
                />
              )),
            )}
          </div>
          <p className="mt-1.5 text-center text-[10px] tracking-wide text-muted uppercase">
            IDPKI
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-[11px] text-muted">
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: BIVARIATE[2][0] }} />
          Kesenjangan
        </li>
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: BIVARIATE[2][2] }} />
          Selaras / simpul
        </li>
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: BIVARIATE[0][2] }} />
          Surplus kapasitas
        </li>
        <li className="flex items-center gap-2">
          <i className="size-2.5" style={{ background: BIVARIATE[0][0] }} />
          Beban rendah
        </li>
      </ul>
    </div>
  );
}
