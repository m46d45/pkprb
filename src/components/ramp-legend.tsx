import { cn, formatInt } from "@/lib/utils";

export function RampLegend({
  title,
  max,
  unit,
  ramp,
  className,
}: {
  title: string;
  max: number;
  unit: string;
  ramp: string[];
  className?: string;
}) {
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
        <span>0</span>
        <span>{formatInt(max / 2)}</span>
        <span>{formatInt(max)}</span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-muted">{unit}</p>
    </div>
  );
}
