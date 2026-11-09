import cityCoordinates from "@/data/city-coordinates.json";
import { centers } from "@/data/centers";
import { programs } from "@/data/programs";
import { BIVARIATE } from "@/lib/palette";
import type { DisciplineId, HazardId } from "@/lib/types";

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
  /** 0 sedikit, 2 banyak. Sumbu datar matriks warna. */
  programClass: 0 | 1 | 2;
  /** 0 tanpa pusat, 1 satu pusat, 2 lebih dari satu. Sumbu tegak matriks warna. */
  centerClass: 0 | 1 | 2;
  color: string;
};

export function placeKey(point: { city: string; province: string }) {
  return `${point.city}|${point.province}`;
}

export const PROGRAM_TIER_LABEL = ["sedikit", "sedang", "banyak"] as const;
export const CENTER_TIER_LABEL = ["tanpa pusat", "satu pusat", "lebih dari satu pusat"] as const;

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

function tertile(sorted: number[], value: number): 0 | 1 | 2 {
  if (sorted.length === 0) return 1;
  const at = (q: number) => {
    const pos = (sorted.length - 1) * q;
    const i = Math.floor(pos);
    const frac = pos - i;
    const a = sorted[i] ?? 0;
    const b = sorted[i + 1] ?? a;
    return a + (b - a) * frac;
  };
  const low = at(1 / 3);
  const high = at(2 / 3);
  if (value <= low) return 0;
  if (value <= high) return 1;
  return 2;
}

function centerClassOf(n: number): 0 | 1 | 2 {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return 2;
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
      programClass: 1,
      centerClass: 0,
      color: BIVARIATE[0][1],
    };
    const list = byCity.get(place.city) ?? [];
    list.push(point);
    byCity.set(place.city, list);
  }

  const points: InstitutionPoint[] = [];
  for (const list of byCity.values()) {
    for (const point of list) points.push(point);
  }
  points.sort((a, b) => a.name.localeCompare(b.name, "id"));
  const programCounts = points.map((point) => point.programs).sort((a, b) => a - b);
  for (const point of points) {
    point.programClass = tertile(programCounts, point.programs);
    point.centerClass = centerClassOf(point.centers);
    point.color = BIVARIATE[point.centerClass][point.programClass] ?? BIVARIATE[1][1];
  }
  return points;
}

export type InstitutionProgramLine = {
  id: string;
  program: string;
  strata: string;
  discipline: DisciplineId;
};

export type InstitutionCenterLine = {
  id: string;
  name: string;
  focus: string;
};

export function institutionLines(hazard: HazardId, university: string) {
  const programLines: InstitutionProgramLine[] = programs
    .filter((item) => item.university === university)
    .map((item) => ({
      id: item.id,
      program: item.program,
      strata: item.strata,
      discipline: item.discipline,
    }));
  const centerLines: InstitutionCenterLine[] = centers
    .filter((item) => item.university === university && centerMatches(hazard, item.hazards))
    .map((item) => ({ id: item.id, name: item.name, focus: item.focus }));
  return { programLines, centerLines };
}
