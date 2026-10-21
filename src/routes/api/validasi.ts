import { timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { buildValidasiCsv, type ValidasiExportRow } from "@/lib/validasi-csv";

const MAX_BODY_BYTES = 32 * 1024;
const SCORE_FIELDS = ["s1", "s2", "s3", "acc_int", "acc_unggul", "acc_bs", "acc_baik"] as const;

/**
 * Token yang sudah dipakai panduan fasilitator. Hanya dipakai bila env kosong,
 * supaya unduhan jalan tanpa mengatur Vercel. Jangan dicetak ke log.
 */
const FACILITATOR_TOKEN_FALLBACK = "12345678";

/**
 * `VALIDASI_TOKEN` didahulukan, lalu `VALIDASI_EXPORT_TOKEN`.
 * Keduanya menimpa nilai bawaan bila diisi.
 */
function configuredToken(): string {
  const primary = process.env.VALIDASI_TOKEN?.trim();
  if (primary) return primary;
  const legacy = process.env.VALIDASI_EXPORT_TOKEN?.trim();
  if (legacy) return legacy;
  return FACILITATOR_TOKEN_FALLBACK;
}

function providedToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  const bearer = /^Bearer\s+(\S+)\s*$/i.exec(header);
  if (bearer?.[1]) return bearer[1];
  return new URL(request.url).searchParams.get("token")?.trim() ?? "";
}

function authorize(request: Request): { ok: true } | { ok: false; error: string } {
  const expected = configuredToken();
  const provided = providedToken(request);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length === 0 || a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: "Token fasilitator salah" };
  }
  return { ok: true };
}

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function newId() {
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function coerceScore(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0 && raw <= 1) return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed.replace(",", "."));
    if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
  }
  return null;
}

/** Angka 0–1 dinormalisasi. Mengembalikan pesan galat, atau null bila lolos. */
function normalizePayload(payload: Record<string, unknown>): string | null {
  for (const key of SCORE_FIELDS) {
    if (!(key in payload) || payload[key] == null || payload[key] === "") continue;
    const n = coerceScore(payload[key]);
    if (n == null) return `Nilai ${key} harus antara 0 dan 1`;
    payload[key] = n;
  }

  if (!("matriks" in payload) || payload.matriks == null) return null;
  if (typeof payload.matriks !== "object" || Array.isArray(payload.matriks)) {
    return "Matriks tidak valid";
  }
  for (const [hazard, cells] of Object.entries(payload.matriks as Record<string, unknown>)) {
    if (!cells || typeof cells !== "object" || Array.isArray(cells)) return "Matriks tidak valid";
    for (const [discipline, raw] of Object.entries(cells as Record<string, unknown>)) {
      const n = coerceScore(raw);
      if (n == null) return `Nilai matriks ${hazard} / ${discipline} harus antara 0 dan 1`;
      (cells as Record<string, unknown>)[discipline] = n;
    }
  }
  return null;
}

function clientIdOf(payload: Record<string, unknown>): string | null | { error: string } {
  if (!("client_id" in payload) || payload.client_id == null || payload.client_id === "") {
    return null;
  }
  if (typeof payload.client_id !== "string") return { error: "client_id harus teks" };
  const id = payload.client_id.trim();
  if (!id) return null;
  if (id.length > 128) return { error: "client_id terlalu panjang" };
  payload.client_id = id;
  return id;
}

async function readJson(
  request: Request,
): Promise<
  { ok: true; value: Record<string, unknown> } | { ok: false; status: number; error: string }
> {
  const contentType = (request.headers.get("content-type") ?? "")
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    return { ok: false, status: 415, error: "Content-Type harus application/json" };
  }
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Isian terlalu besar" };
  }
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Isian terlalu besar" };
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, status: 400, error: "JSON tidak valid" };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, error: "Body harus objek JSON" };
  }
  return { ok: true, value: body as Record<string, unknown> };
}

type SavedRow = {
  id: string;
  duplicate: boolean | string | number;
};

export const Route = createFileRoute("/api/validasi")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = await readJson(request);
        if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);

        const payload = parsed.value;
        const scoreError = normalizePayload(payload);
        if (scoreError) return json({ ok: false, error: scoreError }, 400);

        const clientIdResult = clientIdOf(payload);
        if (clientIdResult && typeof clientIdResult === "object") {
          return json({ ok: false, error: clientIdResult.error }, 400);
        }
        const clientId = clientIdResult;

        const id = newId();
        const versi = typeof payload.versi === "string" ? payload.versi : null;
        const nama = typeof payload.nama === "string" ? payload.nama : null;
        const institusi = typeof payload.institusi === "string" ? payload.institusi : null;

        try {
          const sql = await getSql();
          // Satu pernyataan: INSERT auto-commit sebelum baris dikembalikan.
          // client_id yang sudah ada tidak menulis baris baru.
          const rows = await sql.query<SavedRow>(
            `with inserted as (
               insert into validasi_jawaban (id, versi, nama, institusi, client_id, payload)
               values ($1, $2, $3, $4, $5, $6::jsonb)
               on conflict (client_id) do nothing
               returning id
             )
             select id, false as duplicate from inserted
             union all
             select id, true as duplicate from validasi_jawaban
             where $5::text is not null
               and client_id = $5
               and not exists (select 1 from inserted)`,
            [id, versi, nama, institusi, clientId, JSON.stringify(payload)],
          );
          const saved = rows[0];
          if (!saved?.id) {
            return json({ ok: false, error: "Gagal menyimpan jawaban" }, 500);
          }
          const duplicate =
            saved.duplicate === true || saved.duplicate === "t" || saved.duplicate === 1;
          return json({ ok: true, id: saved.id, duplicate });
        } catch (err) {
          console.error("[validasi] simpan gagal", err instanceof Error ? err.name : "error");
          return json(
            {
              ok: false,
              error: "Gagal menyimpan. Draf di perangkat tetap ada — tekan Kirim lagi.",
            },
            500,
          );
        }
      },

      GET: async ({ request }) => {
        const auth = authorize(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, 401);

        const url = new URL(request.url);
        let rows: Array<{
          id: string;
          created_at: string | Date;
          versi: string | null;
          nama: string | null;
          institusi: string | null;
          payload: Record<string, unknown>;
        }>;
        try {
          const sql = await getSql();
          rows = await sql`
            select id, created_at, versi, nama, institusi, payload
            from validasi_jawaban
            order by created_at asc
          `;
        } catch (err) {
          console.error("[validasi] baca gagal", err instanceof Error ? err.name : "error");
          return json({ ok: false, error: "Gagal membaca jawaban" }, 500);
        }

        const format = (url.searchParams.get("format") ?? "").toLowerCase();
        const stamp = new Date().toISOString().slice(0, 10);
        if (format === "csv") {
          const csv = buildValidasiCsv(rows as ValidasiExportRow[]);
          return new Response(`\uFEFF${csv}`, {
            status: 200,
            headers: {
              "content-type": "text/csv; charset=utf-8",
              "content-disposition": `attachment; filename="pkprb-validasi-${stamp}.csv"`,
              "cache-control": "no-store",
            },
          });
        }

        const download = url.searchParams.get("download");
        if (download === "1" || download === "json" || format === "json") {
          return json(
            {
              diekspor_pada: new Date().toISOString(),
              jumlah: rows.length,
              jawaban: rows.map((r) => ({
                id: r.id,
                created_at: r.created_at,
                ...asObject(r.payload),
              })),
            },
            200,
            {
              "content-disposition": `attachment; filename="pkprb-validasi-${stamp}.json"`,
            },
          );
        }

        return json({
          ok: true,
          jumlah: rows.length,
          jawaban: rows.map((r) => ({
            id: r.id,
            created_at: r.created_at,
            versi: r.versi,
            nama: r.nama,
            institusi: r.institusi,
            payload: r.payload,
          })),
        });
      },

      /**
       * Hanya menghapus baris uji bernama UJI-AGEN. Butuh token dan
       * `?nama=UJI-AGEN` supaya penghapusan tidak terjadi tanpa sengaja.
       */
      DELETE: async ({ request }) => {
        const auth = authorize(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, 401);
        const nama = new URL(request.url).searchParams.get("nama");
        if (nama !== "UJI-AGEN") {
          return json({ ok: false, error: "Penghapusan hanya untuk nama=UJI-AGEN" }, 400);
        }
        try {
          const sql = await getSql();
          const deleted = await sql<{ id: string }>`
            delete from validasi_jawaban
            where nama = 'UJI-AGEN' or payload->>'nama' = 'UJI-AGEN'
            returning id
          `;
          return json({ ok: true, dihapus: deleted.length });
        } catch (err) {
          console.error("[validasi] hapus uji gagal", err instanceof Error ? err.name : "error");
          return json({ ok: false, error: "Gagal menghapus data uji" }, 500);
        }
      },
    },
  },
});

function asObject(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}
