import { useMemo, useRef, useState, type MouseEvent } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import { provinces } from "@/data/provinces";
import { bivariateColor, EDU_RAMP, rampColor, RISK_RAMP } from "@/lib/palette";
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

export function MapCanvas({ geo, scores }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewMode = useMapStore((s) => s.viewMode);
  const selectedId = useMapStore((s) => s.selectedId);
  const setSelectedId = useMapStore((s) => s.setSelectedId);
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

  const idpkiMin = Math.min(...scores.map((s) => s.idpki));
  const idpkiMax = Math.max(...scores.map((s) => s.idpki), 0.001);
  const riskMin = Math.min(...scores.map((s) => s.risk));
  const riskMax = Math.max(...scores.map((s) => s.risk));

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

  function colorFor(name: string) {
    const id = nameToId.get(name);
    const s = id ? scoreMap.get(id) : undefined;
    if (!s) return "#cfc6b8";
    if (viewMode === "keselarasan") return bivariateColor(s.riskClass, s.eduClass);
    if (viewMode === "risiko") {
      const t = (s.risk - riskMin) / Math.max(1e-6, riskMax - riskMin);
      return rampColor(RISK_RAMP, t);
    }
    return rampColor(
      EDU_RAMP,
      (s.idpki - idpkiMin) / Math.max(1e-6, idpkiMax - idpkiMin),
    );
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
      risk: s.risk,
      idpki: s.idpki,
    });
  }

  return (
    <div ref={wrapRef} className="relative h-full w-full bg-sea">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Peta keselarasan pendidikan dan risiko per provinsi"
      >
        <rect width={VB_W} height={VB_H} fill="#d5e0dc" />
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
                strokeWidth: selected ? 2.2 : 0.7,
              }}
              className="cursor-pointer"
              onClick={() => {
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
    </div>
  );
}
