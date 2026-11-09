import cityCoordinates from "@/data/city-coordinates.json";
import { centers } from "@/data/centers";
import { programs } from "@/data/programs";
import type { HazardId } from "@/lib/types";

/** Zoom peta (faktor k) saat lebar layar kira-kira satu provinsi besar. */
export const INSTITUTION_ZOOM_K = 4;

export const INSTITUTION_DISCLAIMER = "indicative only — not an individual assessment";

const EXTRA_CITY: Record<string, string> = {
  "Universitas Ahmad Dahlan": "Kota Yogyakarta",
  "Universitas Muhammadiyah Palu": "Kota Palu",
};

export type InstitutionPoint = {
  id: string;
  name: string;
  city: string;
  province: string;
  lon: number;
  lat: number;
  programs: number;
  centers: number;
};

type Bucket = {
  name: string;
  city: string;
  province: string;
  programs: number;
  centerHazards: HazardId[][];
};

function majorityCity(name: string): { city: string; province: string } | null {
  const counts = new Map<string, { city: string; province: string; n: number }>();
  for (const program of programs) {
    if (program.university !== name) continue;
    const key = `${program.city}\0${program.province}`;
    const row = counts.get(key) ?? { city: program.city, province: program.province, n: 0 };
    row.n += 1;
    counts.set(key, row);
  }
  let best: { city: string; province: string; n: number } | null = null;
  for (const row of counts.values()) {
    if (!best || row.n > best.n) best = row;
  }
  if (best) return best;
  const city = EXTRA_CITY[name];
  const center = centers.find((item) => item.university === name);
  if (!city || !center) return null;
  return { city, province: center.province };
}

function centerMatches(hazard: HazardId, hazards: HazardId[]) {
  return hazard === "composite" || hazards.includes(hazard);
}

/**
 * Titik institusi untuk lapisan zoom. Jumlah prodi adalah banyak baris inventaris.
 * Jumlah pusat mengikuti filter bahaya (komposit = semua pusat institusi itu).
 * Tidak membaca versi bobot dan tidak memuat angka kapasitas.
 */
export function institutionPoints(hazard: HazardId): InstitutionPoint[] {
  const buckets = new Map<string, Bucket>();
  for (const program of programs) {
    const row = buckets.get(program.university) ?? {
      name: program.university,
      city: "",
      province: "",
      programs: 0,
      centerHazards: [],
    };
    row.programs += 1;
    buckets.set(program.university, row);
  }
  for (const center of centers) {
    const row = buckets.get(center.university) ?? {
      name: center.university,
      city: "",
      province: "",
      programs: 0,
      centerHazards: [],
    };
    row.centerHazards.push(center.hazards);
    buckets.set(center.university, row);
  }

  const byCity = new Map<string, InstitutionPoint[]>();
  for (const row of buckets.values()) {
    const place = majorityCity(row.name);
    if (!place) continue;
    const coord = (cityCoordinates as unknown as Record<string, [number, number]>)[place.city];
    if (!coord) continue;
    const point: InstitutionPoint = {
      id: row.name,
      name: row.name,
      city: place.city,
      province: place.province,
      lon: coord[0],
      lat: coord[1],
      programs: row.programs,
      centers: row.centerHazards.filter((hazards) => centerMatches(hazard, hazards)).length,
    };
    const list = byCity.get(place.city) ?? [];
    list.push(point);
    byCity.set(place.city, list);
  }

  const points: InstitutionPoint[] = [];
  for (const list of byCity.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, "id"));
    list.forEach((point, index) => {
      if (index === 0) {
        points.push(point);
        return;
      }
      const angle = (index - 1) * 2.399;
      const ring = 0.045 * (1 + Math.floor((index - 1) / 6));
      const latScale = Math.cos((point.lat * Math.PI) / 180) || 1;
      points.push({
        ...point,
        lon: point.lon + (ring * Math.cos(angle)) / latScale,
        lat: point.lat + ring * Math.sin(angle),
      });
    });
  }
  points.sort((a, b) => a.name.localeCompare(b.name, "id"));
  return points;
}
