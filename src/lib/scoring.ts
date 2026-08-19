import { centers } from "@/data/centers";
import { programs } from "@/data/programs";
import { provinces } from "@/data/provinces";
import type {
  DisciplineId,
  HazardId,
  IabeeStatus,
  Program,
  ProvinceScore,
  Quadrant,
} from "@/lib/types";

export type ScoringOptions = {
  hazard: HazardId;
  weights: Record<DisciplineId, number>;
  enabled: Record<DisciplineId, boolean>;
  includeCenters: boolean;
  includeIabee: boolean;
  includeSpillover: boolean;
};

const STRATA: Record<string, number> = { S3: 1, S2: 0.75, S1: 0.5, D4: 0.4 };

function accreditationQ(label: string) {
  const p = label.toLowerCase();
  if (p.includes("unggul") || p === "a") return 1;
  if (p.includes("baik sekali") || p === "b") return 0.8;
  if (p === "baik" || p === "c") return 0.6;
  return 0.4;
}

function iabeeBonus(status: IabeeStatus, include: boolean) {
  if (!include) return 0;
  if (status === "general") return 0.25;
  if (status === "provisional") return 0.1;
  return 0;
}

const NATIONAL_PT = new Set([
  "Institut Teknologi Bandung",
  "Universitas Indonesia",
  "Universitas Gadjah Mada",
  "Institut Teknologi Sepuluh Nopember",
]);

function programScore(p: Program, opt: ScoringOptions) {
  if (!opt.enabled[p.discipline]) return 0;
  const w = opt.weights[p.discipline] ?? 0;
  if (w <= 0) return 0;
  return (
    w *
    (STRATA[p.strata] ?? 0.5) *
    accreditationQ(p.accreditation) *
    (1 + iabeeBonus(p.iabee, opt.includeIabee))
  );
}

function centerScore(hazard: HazardId, c: (typeof centers)[number]) {
  const maturity = c.maturity === "anchor" ? 1.35 : c.maturity === "pui" ? 1.2 : 1;
  const match =
    hazard === "composite"
      ? 1
      : c.hazards.includes(hazard)
        ? 1
        : 0.2;
  const national = c.national ? 1.2 : 1;
  const pkm = c.pkm ? 1.1 : 1;
  return 1.35 * maturity * match * national * pkm;
}

function quantile(sorted: number[], q: number) {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const i = Math.floor(pos);
  const frac = pos - i;
  const a = sorted[i] ?? 0;
  const b = sorted[i + 1] ?? a;
  return a + (b - a) * frac;
}

function klass(values: number[], v: number): 0 | 1 | 2 {
  if (values.length === 0) return 1;
  const s = [...values].sort((a, b) => a - b);
  const a = s[0] ?? 0;
  const b = s[s.length - 1] ?? 0;
  if (b - a < 1e-9) return 1;
  const t1 = quantile(s, 1 / 3);
  const t2 = quantile(s, 2 / 3);
  if (v <= t1) return 0;
  if (v <= t2) return 1;
  return 2;
}

function quadrantOf(r: 0 | 1 | 2, e: 0 | 1 | 2): Quadrant {
  if (r === 2 && e === 0) return "kesenjangan";
  if (r === 2 && e === 2) return "selaras";
  if (r === 0 && e === 2) return "surplus";
  if (r === 0 && e === 0) return "beban-rendah";
  return "menengah";
}

const byName = new Map(provinces.map((p) => [p.name, p]));
const byId = new Map(provinces.map((p) => [p.id, p]));

export function scoreProvinces(opt: ScoringOptions): ProvinceScore[] {
  const capacity = new Map<string, number>();
  const education = new Map<string, number>();
  const research = new Map<string, number>();
  for (const p of provinces) {
    capacity.set(p.id, 0);
    education.set(p.id, 0);
    research.set(p.id, 0);
  }

  const add = (provName: string, amount: number, bucket: "edu" | "res") => {
    const prov = byName.get(provName);
    if (!prov || amount <= 0) return;
    capacity.set(prov.id, (capacity.get(prov.id) ?? 0) + amount);
    if (bucket === "edu") education.set(prov.id, (education.get(prov.id) ?? 0) + amount);
    else research.set(prov.id, (research.get(prov.id) ?? 0) + amount);
  };

  const spill = (homeName: string, amount: number, national: boolean, bucket: "edu" | "res") => {
    if (!opt.includeSpillover || amount <= 0) return;
    const home = byName.get(homeName);
    if (!home) return;
    const islandShare = national ? 0.1 : 0.06;
    const nationShare = national ? 0.05 : 0;
    for (const p of provinces) {
      if (p.id === home.id) continue;
      if (p.island === home.island) add(p.name, amount * islandShare, bucket);
      else if (nationShare) add(p.name, amount * nationShare, bucket);
    }
  };

  for (const prog of programs) {
    const s = programScore(prog, opt);
    if (s <= 0) continue;
    add(prog.province, s, "edu");
    const national = NATIONAL_PT.has(prog.university) || prog.iabee === "general";
    spill(prog.province, s, national, "edu");
  }

  if (opt.includeCenters) {
    for (const c of centers) {
      const s = centerScore(opt.hazard, c);
      add(c.province, s, "res");
      spill(c.province, s, c.national, "res");
    }
  }

  const rows: Omit<ProvinceScore, "riskClass" | "eduClass" | "quadrant" | "gap">[] = provinces.map(
    (p) => {
      const cap = capacity.get(p.id) ?? 0;
      const popM = p.population / 1_000_000;
      const idpki = popM > 0 ? cap / popM : 0;
      const risk = p.risk[opt.hazard];
      return {
        provinceId: p.id,
        risk,
        idpki,
        capacity: cap,
        education: education.get(p.id) ?? 0,
        research: research.get(p.id) ?? 0,
      };
    },
  );

  const risks = rows.map((r) => r.risk);
  const edus = rows.map((r) => r.idpki);
  const minR = Math.min(...risks);
  const maxR = Math.max(...risks);
  const minE = Math.min(...edus);
  const maxE = Math.max(...edus);

  return rows.map((r) => {
    const riskClass = klass(risks, r.risk);
    const eduClass = klass(edus, r.idpki);
    const riskN = maxR === minR ? 0.5 : (r.risk - minR) / (maxR - minR);
    const eduN = maxE === minE ? 0.5 : (r.idpki - minE) / (maxE - minE);
    return {
      ...r,
      riskClass,
      eduClass,
      quadrant: quadrantOf(riskClass, eduClass),
      gap: riskN - eduN,
    };
  });
}

export function getProvince(id: string) {
  return byId.get(id);
}

export function programsIn(provinceName: string, opt: ScoringOptions) {
  return programs.filter(
    (p) => p.province === provinceName && opt.enabled[p.discipline] && (opt.weights[p.discipline] ?? 0) > 0,
  );
}

export function centersIn(provinceName: string) {
  return centers.filter((c) => c.province === provinceName);
}

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  kesenjangan: "Kesenjangan kapasitas pendidikan",
  selaras: "Selaras / simpul",
  surplus: "Surplus kapasitas",
  "beban-rendah": "Beban rendah",
  menengah: "Menengah",
};
