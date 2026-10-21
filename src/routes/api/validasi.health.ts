import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** Cek koneksi basis data. Tidak mengembalikan jawaban peserta. */
export const Route = createFileRoute("/api/validasi/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const sql = await getSql();
          await sql`select 1 as ok`;
          return json({ ok: true, db: "ok" });
        } catch (err) {
          console.error("[validasi] health gagal", err instanceof Error ? err.name : "error");
          return json({ ok: false, db: "error" }, 503);
        }
      },
    },
  },
});
