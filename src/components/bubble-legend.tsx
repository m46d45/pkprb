import { cn, formatInt } from "@/lib/utils";

export function BubbleLegend({
  maxDeaths,
  className,
}: {
  maxDeaths: number;
  className?: string;
}) {
  const samples = [10, 100, 1000, Math.max(1000, maxDeaths)].filter(
    (n, i, a) => n <= maxDeaths && a.indexOf(n) === i,
  );
  if (maxDeaths > 0 && samples[samples.length - 1] !== maxDeaths) {
    samples.push(maxDeaths);
  }
  return (
    <div className={cn("w-52 select-none", className)}>
      <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
        Legenda
      </p>
      <p className="mb-1.5 text-[12px]">Korban jiwa, 2000–kini</p>
      <div className="flex items-end gap-3">
        {samples.slice(0, 4).map((n) => {
          const r = bubbleRadius(n, maxDeaths);
          return (
            <div key={n} className="flex flex-col items-center gap-1">
              <span
                className="inline-block rounded-full"
                style={{
                  width: r * 2,
                  height: r * 2,
                  background: "#c45c48",
                  opacity: 0.85,
                }}
              />
              <span className="text-[9px] tabular-nums text-muted">
                {formatInt(n)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-[10px] leading-snug text-muted">
        Kurasi kejadian signifikan, bukan DIBI lengkap. Karhutla understated.
      </p>
    </div>
  );
}

export function bubbleRadius(deaths: number, maxDeaths: number) {
  if (deaths <= 0 || maxDeaths <= 0) return 0;
  const t = Math.log1p(deaths) / Math.log1p(maxDeaths);
  return 3.5 + 18 * t;
}
