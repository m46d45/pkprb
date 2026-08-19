import geojson from "@/data/indonesia.json";
import { MapCanvas } from "@/components/map-canvas";
import type { ProvinceScore } from "@/lib/types";
import type { FeatureCollection, Geometry } from "geojson";

export function MapView({ scores }: { scores: ProvinceScore[] }) {
  return (
    <MapCanvas
      geo={geojson as FeatureCollection<Geometry, { PROVINSI: string; KODE_PROV: string }>}
      scores={scores}
    />
  );
}
