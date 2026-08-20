import { cn, formatInt } from "@/lib/utils";

export function RampLegend({
  title,
  min = 0,
  max,
  unit,
  ramp,
  className,
}: {
  title: string;
  min?: number;
  max: number;
  unit: string;
  ramp: string[];
  className?: string;
}) {
  const mid = min + (max - min) / 2;
  const tick = (n: number) =>
    Number.isInteger(n) ? formatInt(n) : n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  return (
    <div className={cn("w-52 select-none", className)}>
      <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
        Legenda
      </p>
      <p className="mb-1.5 text-[12px]">{title}</p>
      <div
        className="h-3 w-full rounded-sm"
        style={{ background: `linear-gradient(to right, ${ramp.join(",")})` }}
      />
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
        <span>{tick(min)}</span>
        <span>{min === 1 && max === 10 ? "5" : tick(mid)}</span>
        <span>{tick(max)}</span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-muted">{unit}</p>
    </div>
  );
}