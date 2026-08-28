import { centers } from "@/data/centers";
import { events } from "@/data/events";
import { programs } from "@/data/programs";
import { provinces } from "@/data/provinces";
import { ptAccreditation } from "@/data/universities";
import type {
  AccLevel,
  DisciplineId,
  HazardId,
  Program,
  ProvinceScore,
  Quadrant,
  ResponsQuadrant,
  StrataLevel,
} from "@/lib/types";

export type ScoringOptions = {
  hazard: HazardId;
  weights: Record<DisciplineId, number>;
  strataWeights: Record<StrataLevel, number>;
  accWeights: Record<AccLevel, number>;
  centerWeight: number;
  kepakaranWeight: number;
  spilloverWeight: number;
};

export function prodiAccLevel(p: Program): AccLevel {
  if (p.iabee === "general" || p.iabee === "provisional") return "internasional";
  const a = p.accreditation.toLowerCase();
  if (a.includes("unggul") || a === "a") return "unggul";
  if (a.includes("baik sekali") || a === "b") return "baik-sekali";
  return "baik";
}

function strataKey(strata: Program["strata"]): StrataLevel {
  if (strata === "S3") return "S3";
  if (strata === "S2") return "S2";
  return "S1";
}

function programScore(p: Program, opt: ScoringOptions) {
  const w = opt.weights[p.discipline] ?? 0;
  if (w <= 0) return 0;
  const st = opt.strataWeights[strataKey(p.strata)] ?? 0;
  if (st <= 0) return 0;
  const acc = opt.accWeights[prodiAccLevel(p)] ?? 0;
  if (acc <= 0) return 0;
  return w * st * acc;
}

function centerResearchScore(hazard: HazardId, c: (typeof centers)[number]) {
  const maturity = c.maturity === "anchor" ? 1.35 : c.maturity === "pui" ? 1.2 : 1;
  const match =
    hazard === "composite" ? 1 : c.hazards.includes(hazard) ? 1 : 0.2;
  const national = c.national ? 1.2 : 1;
  return 1.35 * maturity * match * national;
}

function centerKepakaranScore(hazard: HazardId, c: (typeof centers)[number]) {
  if (!c.pkm) return 0;
  const maturity = c.maturity === "anchor" ? 1.2 : c.maturity === "pui" ? 1.1 : 1;
  const match =
    hazard === "composite" ? 1 : c.hazards.includes(hazard) ? 1 : 0.2;
  return 1.1 * maturity * match;
}

/** Pool radiated from the source, split among recipients (not cloned). */
function spillShares(acc: AccLevel) {
  if (acc === "internasional") return { island: 0.12, nation: 0.06 };
  if (acc === "unggul") return { island: 0.08, nation: 0.03 };
  if (acc === "baik-sekali") return { island: 0.04, nation: 0 };
  return { island: 0, nation: 0 };
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

function responsOf(h: 0 | 1 | 2, p: 0 | 1 | 2): ResponsQuadrant {
  if (h === 2 && p === 2) return "responsif";
  if (h === 2 && p === 0) return "tidak-melembaga";
  if (h === 0 && p === 2) return "antisipatif";
  if (h === 0 && p === 0) return "belum-terespons";
  return "menengah";
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
  const service = new Map<string, number>();
  const imported = new Map<string, number>();
  const localPusat = new Map<string, number>();
  for (const p of provinces) {
    capacity.set(p.id, 0);
    education.set(p.id, 0);
    research.set(p.id, 0);
    service.set(p.id, 0);
    imported.set(p.id, 0);
    localPusat.set(p.id, 0);
  }

  const add = (
    provName: string,
    amount: number,
    bucket: "edu" | "res" | "svc",
    fromSpill = false,
    toPusat = true,
  ) => {
    const prov = byName.get(provName);
    if (!prov || amount <= 0) return;
    capacity.set(prov.id, (capacity.get(prov.id) ?? 0) + amount);
    if (bucket === "edu") education.set(prov.id, (education.get(prov.id) ?? 0) + amount);
    else if (bucket === "res") research.set(prov.id, (research.get(prov.id) ?? 0) + amount);
    else service.set(prov.id, (service.get(prov.id) ?? 0) + amount);
    if (!fromSpill && toPusat && (bucket === "res" || bucket === "svc")) {
      localPusat.set(prov.id, (localPusat.get(prov.id) ?? 0) + amount);
    }
  };

  const spill = (
    homeName: string,
    amount: number,
    university: string,
    bucket: "edu" | "res" | "svc",
  ) => {
    if (opt.spilloverWeight <= 0 || amount <= 0) return;
    const home = byName.get(homeName);
    if (!home) return;
    const { island, nation } = spillShares(ptAccreditation(university));
    const islandPool = amount * island * opt.spilloverWeight;
    const nationPool = amount * nation * opt.spilloverWeight;
    const islandOthers = provinces.filter(
      (p) => p.id !== home.id && p.island === home.island,
    );
    const nationOthers = provinces.filter(
      (p) => p.id !== home.id && p.island !== home.island,
    );
    const islandEach =
      islandOthers.length > 0 ? islandPool / islandOthers.length : 0;
    const nationEach =
      nationOthers.length > 0 ? nationPool / nationOthers.length : 0;
    for (const p of islandOthers) {
      add(p.name, islandEach, bucket, true);
      imported.set(p.id, (imported.get(p.id) ?? 0) + islandEach);
    }
    for (const p of nationOthers) {
      add(p.name, nationEach, bucket, true);
      imported.set(p.id, (imported.get(p.id) ?? 0) + nationEach);
    }
  };

  for (const prog of programs) {
    const s = programScore(prog, opt);
    if (s <= 0) continue;
    add(prog.province, s, "edu");
    spill(prog.province, s, prog.university, "edu");
  }

  if (opt.centerWeight > 0) {
    for (const c of centers) {
      const s = opt.centerWeight * centerResearchScore(opt.hazard, c);
      const matched =
        opt.hazard === "composite" || c.hazards.includes(opt.hazard);
      add(c.province, s, "res", false, matched);
      spill(c.province, s, c.university, "res");
    }
  }

  if (opt.kepakaranWeight > 0) {
    for (const c of centers) {
      const s = opt.kepakaranWeight * centerKepakaranScore(opt.hazard, c);
      if (s <= 0) continue;
      const matched =
        opt.hazard === "composite" || c.hazards.includes(opt.hazard);
      add(c.province, s, "svc", false, matched);
      spill(c.province, s, c.university, "svc");
    }
  }

  const rows: Omit<
    ProvinceScore,
    "riskClass" | "eduClass" | "quadrant" | "gap" | "historisClass" | "pusatClass" | "respons"
  >[] =
    provinces.map((p) => {
      const cap = capacity.get(p.id) ?? 0;
      const popM = p.population / 1_000_000;
      const perJuta = popM > 0 ? cap / popM : 0;
      const idpki = Math.log(1 + cap);
      const risk = p.risk.composite;
      const deaths = historisDeaths(p.name, opt.hazard);
      const historisLn = Math.log(1 + deaths);
      const pusat = localPusat.get(p.id) ?? 0;
      return {
        provinceId: p.id,
        risk,
        idpki,
        perJuta,
        capacity: cap,
        education: education.get(p.id) ?? 0,
        research: research.get(p.id) ?? 0,
        service: service.get(p.id) ?? 0,
        spillover: imported.get(p.id) ?? 0,
        deaths,
        historisLn,
        pusat,
      };
    });

  const risks = rows.map((r) => r.risk);
  const edus = rows.map((r) => r.idpki);
  const pusatVals = rows.map((r) => r.pusat);
  const minR = Math.min(...risks);
  const maxR = Math.max(...risks);
  const minE = Math.min(...edus);
  const maxE = Math.max(...edus);

  return rows.map((r) => {
    const riskClass = klass(risks, r.risk);
    const eduClass = klass(edus, r.idpki);
    const historisClass = klass(
      rows.map((x) => x.historisLn),
      r.historisLn,
    );
    const pusatClass = klass(pusatVals, r.pusat);
    const riskN = maxR === minR ? 0.5 : (r.risk - minR) / (maxR - minR);
    const eduN = maxE === minE ? 0.5 : (r.idpki - minE) / (maxE - minE);
    return {
      ...r,
      riskClass,
      eduClass,
      historisClass,
      pusatClass,
      respons: responsOf(historisClass, pusatClass),
      quadrant: quadrantOf(riskClass, eduClass),
      gap: riskN - eduN,
    };
  });
}

export function getProvince(id: string) {
  return byId.get(id);
}

export function historisDeaths(provinceName: string, hazard: HazardId) {
  return events
    .filter(
      (e) =>
        e.province === provinceName &&
        (hazard === "composite" || e.hazards.includes(hazard)),
    )
    .reduce((sum, e) => sum + e.deaths, 0);
}

export function eventsIn(provinceName: string, hazard: HazardId) {
  return events
    .filter(
      (e) =>
        e.province === provinceName &&
        (hazard === "composite" || e.hazards.includes(hazard)),
    )
    .sort((a, b) => b.year - a.year || b.deaths - a.deaths);
}

export function programsIn(provinceName: string, opt: ScoringOptions) {
  return programs.filter(
    (p) =>
      p.province === provinceName &&
      (opt.weights[p.discipline] ?? 0) > 0 &&
      (opt.strataWeights[strataKey(p.strata)] ?? 0) > 0 &&
      (opt.accWeights[prodiAccLevel(p)] ?? 0) > 0,
  );
}

export function centersIn(provinceName: string) {
  return centers.filter((c) => c.province === provinceName);
}

export const RESPONS_LABEL: Record<ResponsQuadrant, string> = {
  responsif: "Responsif",
  "tidak-melembaga": "Tidak melembaga",
  antisipatif: "Antisipatif",
  "belum-terespons": "Belum terespons",
  menengah: "Menengah",
};

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  kesenjangan: "Senjang",
  selaras: "Selaras",
  surplus: "Berlebih",
  "beban-rendah": "Relevan",
  menengah: "Menengah",
};
