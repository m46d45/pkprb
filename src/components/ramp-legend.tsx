import { cn, formatNumber } from "@/lib/utils";

export function RampLegend({
  title,
  min,
  max,
  ramp,
  className,
}: {
  title: string;
  min: number;
  max: number;
  ramp: string[];
  className?: string;
}) {
  const mid = (min + max) / 2;
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
        <span>{formatNumber(min)}</span>
        <span>{formatNumber(mid)}</span>
        <span>{formatNumber(max)}</span>
      </div>
    </div>
  );
}
