import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import { provinces } from "@/data/provinces";
import { bivariateColor, EDU_CAP, EDU_RAMP, rampColor, RISK_RAMP, riskCap, toScale10 } from "@/lib/palette";
import type { ProvinceScore } from "@/lib/types";
import { useMapStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

type Geo = FeatureCollection<Geometry, { PROVINSI: string; KODE_PROV: string }>;

type Props = {
  geo: Geo;
  scores: ProvinceScore[];
};

const VB_W = 1100;
const VB_H = 480;
const MIN_K = 1;
const MAX_K = 10;

type Transform = { k: number; x: number; y: number };

function reverseRing(ring: Position[]) {
  return ring.slice().reverse();
}

function reversePolygon(poly: Position[][]) {
  return poly.map((ring, i) => (i === 0 ? reverseRing(ring) : ring));
}

/** RFC7946 CCW exteriors fill the whole globe in d3-geo; rewind for spherical clipping. */
function rewindGeo(geo: Geo): Geo {
  return {
    ...geo,
    features: geo.features.map((f) => {
      const g = f.geometry;
      if (g.type === "Polygon") {
        return {
          ...f,
          geometry: { ...g, coordinates: reversePolygon(g.coordinates) },
        };
      }
      if (g.type === "MultiPolygon") {
        return {
          ...f,
          geometry: { ...g, coordinates: g.coordinates.map(reversePolygon) },
        };
      }
      return f;
    }),
  };
}

function clampK(k: number) {
  return Math.min(MAX_K, Math.max(MIN_K, k));
}

function zoomAt(t: Transform, cx: number, cy: number, nextK: number): Transform {
  const k = clampK(nextK);
  if (k === t.k) return t;
  const x = cx * (1 - k / t.k) + t.x * (k / t.k);
  const y = cy * (1 - k / t.k) + t.y * (k / t.k);
  if (k <= MIN_K + 1e-6) return { k: 1, x: 0, y: 0 };
  return { k, x, y };
}

export function MapCanvas({ geo, scores }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tRef = useRef<Transform>({ k: 1, x: 0, y: 0 });
  const dragRef = useRef({
    down: false,
    moved: false,
    id: -1,
    lx: 0,
    ly: 0,
  });
  const pinchRef = useRef<{
    dist: number;
    cx: number;
    cy: number;
  } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());

  const viewMode = useMapStore((s) => s.viewMode);
  const hazard = useMapStore((s) => s.hazard);
  const selectedId = useMapStore((s) => s.selectedId);
  const setSelectedId = useMapStore((s) => s.setSelectedId);
  const [t, setT] = useState<Transform>({ k: 1, x: 0, y: 0 });
  const [hover, setHover] = useState<{
    name: string;
    x: number;
    y: number;
    risk: number;
    idpki: number;
  } | null>(null);

  const nameToId = useMemo(
    () => new Map(provinces.map((p) => [p.geoName, p.id])),
    [],
  );
  const scoreMap = useMemo(
    () => new Map(scores.map((s) => [s.provinceId, s])),
    [scores],
  );

  const drawn = useMemo(() => rewindGeo(geo), [geo]);

  const pathGen = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [12, 18],
        [VB_W - 12, VB_H - 18],
      ],
      drawn as FeatureCollection,
    );
    return geoPath(projection);
  }, [drawn]);

  function apply(next: Transform) {
    tRef.current = next;
    setT(next);
  }

  function clientToVb(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: VB_W / 2, y: VB_H / 2 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: VB_W / 2, y: VB_H / 2 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cur = tRef.current;
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      const p = clientToVb(e.clientX, e.clientY);
      apply(zoomAt(cur, p.x, p.y, cur.k * factor));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function colorFor(name: string) {
    const id = nameToId.get(name);
    const s = id ? scoreMap.get(id) : undefined;
    if (!s) return "#cfc6b8";
    if (viewMode === "keselarasan") return bivariateColor(s.riskClass, s.eduClass);
    if (viewMode === "risiko") {
      return rampColor(RISK_RAMP, s.risk / riskCap(hazard));
    }
    return rampColor(EDU_RAMP, s.idpki / EDU_CAP);
  }

  function placeHover(
    e: MouseEvent,
    name: string,
    s: { risk: number; idpki: number },
  ) {
    const r = wrapRef.current?.getBoundingClientRect();
    setHover({
      name,
      x: e.clientX - (r?.left ?? 0),
      y: e.clientY - (r?.top ?? 0),
      risk: toScale10(s.risk, riskCap(hazard)),
      idpki: toScale10(s.idpki, EDU_CAP),
    });
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()];
      const a = pts[0];
      const b = pts[1];
      if (!a || !b) return;
      const mid = clientToVb((a.x + b.x) / 2, (a.y + b.y) / 2);
      pinchRef.current = {
        dist: Math.hypot(b.x - a.x, b.y - a.y),
        cx: mid.x,
        cy: mid.y,
      };
      dragRef.current.down = false;
      return;
    }
    dragRef.current = {
      down: true,
      moved: false,
      id: e.pointerId,
      lx: e.clientX,
      ly: e.clientY,
    };
  }

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const a = pts[0];
      const b = pts[1];
      if (!a || !b) return;
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const factor = dist / Math.max(1, pinchRef.current.dist);
      pinchRef.current.dist = dist;
      const cur = tRef.current;
      apply(zoomAt(cur, pinchRef.current.cx, pinchRef.current.cy, cur.k * factor));
      return;
    }
    const d = dragRef.current;
    if (!d.down || d.id !== e.pointerId) return;
    const svg = svgRef.current;
    const w = svg?.clientWidth || wrapRef.current?.clientWidth || VB_W;
    const scale = VB_W / w;
    const dx = (e.clientX - d.lx) * scale;
    const dy = (e.clientY - d.ly) * scale;
    if (Math.hypot(e.clientX - d.lx, e.clientY - d.ly) > 4) d.moved = true;
    d.lx = e.clientX;
    d.ly = e.clientY;
    const cur = tRef.current;
    if (cur.k <= 1) return;
    apply({ k: cur.k, x: cur.x + dx, y: cur.y + dy });
  }

  function onPointerUp(e: PointerEvent<SVGSVGElement>) {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (dragRef.current.id === e.pointerId) {
      dragRef.current.down = false;
    }
  }

  function zoomButton(dir: 1 | -1) {
    const cur = tRef.current;
    apply(zoomAt(cur, VB_W / 2, VB_H / 2, cur.k * (dir > 0 ? 1.35 : 1 / 1.35)));
  }

  const stroke = Math.max(0.35, 0.7 / t.k);
  const strokeSel = Math.max(0.8, 2.2 / t.k);

  return (
    <div ref={wrapRef} className="relative h-full w-full touch-none bg-sea">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Peta keselarasan pendidikan dan risiko per provinsi"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => {
          const p = clientToVb(e.clientX, e.clientY);
          apply(zoomAt(tRef.current, p.x, p.y, tRef.current.k * 1.6));
        }}
      >
        <rect width={VB_W} height={VB_H} fill="#d5e0dc" />
        <g transform={`translate(${t.x} ${t.y}) scale(${t.k})`}>
          {drawn.features.map((f: Feature<Geometry, { PROVINSI: string }>) => {
            const name = f.properties?.PROVINSI ?? "";
            const id = nameToId.get(name);
            const s = id ? scoreMap.get(id) : undefined;
            const selected = id === selectedId;
            const d = pathGen(f as Feature) ?? "";
            return (
              <path
                key={`${name}-${String(f.id ?? "")}`}
                d={d}
                style={{
                  fill: colorFor(name),
                  stroke: selected ? "#1f1a16" : "#fffaf3",
                  strokeWidth: selected ? strokeSel : stroke,
                }}
                className="cursor-pointer"
                onClick={() => {
                  if (dragRef.current.moved) return;
                  if (id) setSelectedId(id);
                }}
                onMouseEnter={(e) => {
                  if (s) placeHover(e, name, s);
                }}
                onMouseMove={(e) => {
                  if (s) placeHover(e, name, s);
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </g>
      </svg>
      {hover ? (
        <div
          className="pointer-events-none absolute z-10 rounded-md bg-ink px-2.5 py-1.5 text-[12px] text-paper"
          style={{
            left: Math.min(
              hover.x + 12,
              (wrapRef.current?.clientWidth ?? 360) - 180,
            ),
            top: Math.max(8, hover.y - 42),
          }}
        >
          <strong>{hover.name}</strong>
          <br />
          {viewMode === "keselarasan"
            ? `Risiko ${formatNumber(hover.risk)} · Pendidikan ${formatNumber(hover.idpki)}`
            : viewMode === "risiko"
              ? `Risiko ${formatNumber(hover.risk)}`
              : `Pendidikan ${formatNumber(hover.idpki)}`}
        </div>
      ) : null}
      <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-md border border-line bg-surface/95 shadow-sm">
        <button
          type="button"
          className="flex size-8 items-center justify-center hover:bg-paper"
          aria-label="Perbesar"
          onClick={() => zoomButton(1)}
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-8 items-center justify-center border-t border-line hover:bg-paper"
          aria-label="Perkecil"
          onClick={() => zoomButton(-1)}
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-8 items-center justify-center border-t border-line hover:bg-paper"
          aria-label="Reset peta"
          onClick={() => apply({ k: 1, x: 0, y: 0 })}
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
