import geojson from "@/data/indonesia.json";
import { MapCanvas } from "@/components/map-canvas";
import type { InstitutionPoint } from "@/lib/institutions";
import type { ProvinceScore } from "@/lib/types";
import type { FeatureCollection, Geometry } from "geojson";

export function MapView({
  scores,
  sensitiveIds,
  institutions,
}: {
  scores: ProvinceScore[];
  sensitiveIds: ReadonlySet<string>;
  institutions: InstitutionPoint[];
}) {
  return (
    <MapCanvas
      geo={geojson as FeatureCollection<Geometry, { PROVINSI: string; KODE_PROV: string }>}
      scores={scores}
      sensitiveIds={sensitiveIds}
      institutions={institutions}
    />
  );
}
