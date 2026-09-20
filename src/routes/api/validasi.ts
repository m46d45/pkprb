import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

/** Token unduh fasilitator. Default 12345678; override dengan VALIDASI_EXPORT_TOKEN. */
function exportToken() {
  const fromEnv =
    typeof process !== "undefined" ? process.env.VALIDASI_EXPORT_TOKEN : undefined;
  const trimmed = fromEnv?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "12345678";
}

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function newId() {
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const Route = createFileRoute("/api/validasi")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "JSON tidak valid" }, 400);
        }
        if (!body || typeof body !== "object" || Array.isArray(body)) {
          return json({ ok: false, error: "Body harus objek JSON" }, 400);
        }
        const payload = body as Record<string, unknown>;
        const id = newId();
        const versi =
          typeof payload.versi === "string" ? payload.versi : null;
        const nama = typeof payload.nama === "string" ? payload.nama : null;
        const institusi =
          typeof payload.institusi === "string" ? payload.institusi : null;

        const sql = await getSql();
        await sql`
          insert into validasi_jawaban (id, versi, nama, institusi, payload)
          values (${id}, ${versi}, ${nama}, ${institusi}, ${JSON.stringify(payload)}::jsonb)
        `;

        return json({ ok: true, id });
      },

      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        if (token !== exportToken()) {
          return json({ ok: false, error: "Token fasilitator salah" }, 401);
        }

        const sql = await getSql();
        const rows = await sql<{
          id: string;
          created_at: string;
          versi: string | null;
          nama: string | null;
          institusi: string | null;
          payload: Record<string, unknown>;
        }>`
          select id, created_at, versi, nama, institusi, payload
          from validasi_jawaban
          order by created_at asc
        `;

        const download = url.searchParams.get("download");
        if (download === "1" || download === "json") {
          const stamp = new Date().toISOString().slice(0, 10);
          return json(
            {
              diekspor_pada: new Date().toISOString(),
              jumlah: rows.length,
              jawaban: rows.map((r) => ({
                id: r.id,
                created_at: r.created_at,
                ...r.payload,
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
    },
  },
});
