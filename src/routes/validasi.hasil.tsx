import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Ringkas = {
  id: string;
  created_at: string;
  versi: string | null;
  nama: string | null;
  institusi: string | null;
};

export const Route = createFileRoute("/validasi/hasil")({
  component: ValidasiHasilPage,
  head: () => ({
    meta: [
      { title: "Hasil validasi — PKPRB" },
      {
        name: "description",
        content: "Unduh jawaban validator (fasilitator saja).",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token.trim()}` };
}

function ValidasiHasilPage() {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem("pkprb-validasi-token") ?? "";
    } catch {
      return "";
    }
  });
  const [rows, setRows] = useState<Ringkas[] | null>(null);
  const [jumlah, setJumlah] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function muat(explicit?: string) {
    const used = (explicit ?? token).trim();
    if (!used) return;
    setBusy(true);
    setError(null);
    try {
      sessionStorage.setItem("pkprb-validasi-token", used);
      const res = await fetch("/api/validasi", { headers: authHeaders(used) });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        jumlah?: number;
        jawaban?: Array<{
          id: string;
          created_at: string;
          versi: string | null;
          nama: string | null;
          institusi: string | null;
        }>;
      };
      if (!res.ok || !data.ok) {
        setRows(null);
        setJumlah(null);
        setError(data.error ?? `Gagal (${res.status})`);
        return;
      }
      const list = (data.jawaban ?? []).map((j) => ({
        id: j.id,
        created_at: j.created_at,
        versi: j.versi,
        nama: j.nama,
        institusi: j.institusi,
      }));
      setRows(list);
      setJumlah(typeof data.jumlah === "number" ? data.jumlah : list.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setRows(null);
      setJumlah(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem("pkprb-validasi-token") ?? "";
    } catch {
      saved = "";
    }
    if (saved.trim()) void muat(saved);
    // Muat jumlah sekali saat halaman dibuka bila token sesi sudah ada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unduh(kind: "json" | "csv") {
    const used = token.trim();
    if (!used) return;
    setError(null);
    try {
      sessionStorage.setItem("pkprb-validasi-token", used);
      const url = kind === "csv" ? "/api/validasi?format=csv" : "/api/validasi?download=1";
      const res = await fetch(url, { headers: authHeaders(used) });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Gagal unduh (${res.status})`);
        return;
      }
      const blob = await res.blob();
      const stamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = kind === "csv" ? `pkprb-validasi-${stamp}.csv` : `pkprb-validasi-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunduh");
    }
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-sm hover:border-ink"
          >
            ← Peta
          </Link>
          <span className="font-display text-lg">Hasil validasi</span>
          <a
            href="/kuesioner.html"
            className="ml-auto rounded-md border border-line px-2.5 py-1.5 text-sm hover:border-ink"
          >
            Form validator
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="space-y-2">
          <h1 className="font-display text-3xl leading-tight">Unduh jawaban validator</h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Halaman fasilitator. Peserta menekan <strong className="text-ink">Kirim isian</strong>{" "}
            di form; jawaban langsung tersimpan di server. Unduh JSON atau CSV dari sini.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <label className="block text-sm font-medium">
            Token fasilitator
            <input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-[16px]"
              placeholder="Token unduh"
            />
          </label>
          <p className="text-[13px] text-muted">
            Token dibagikan penyelenggara. Server membacanya dari lingkungan (
            <code className="rounded bg-line/60 px-1">VALIDASI_TOKEN</code>
            ), bukan dari halaman ini.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !token.trim()}
              onClick={() => void muat()}
              className="rounded-md bg-teal px-3.5 py-2 text-sm font-medium text-paper disabled:opacity-50"
            >
              {busy ? "Memuat…" : "Tampilkan daftar"}
            </button>
            <button
              type="button"
              disabled={!token.trim()}
              onClick={() => void unduh("json")}
              className="rounded-md border border-line bg-paper px-3.5 py-2 text-sm font-medium hover:border-ink disabled:opacity-50"
            >
              Unduh semua JSON
            </button>
            <button
              type="button"
              disabled={!token.trim()}
              onClick={() => void unduh("csv")}
              className="rounded-md border border-line bg-paper px-3.5 py-2 text-sm font-medium hover:border-ink disabled:opacity-50"
            >
              Unduh CSV
            </button>
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        {jumlah != null ? (
          <section className="space-y-3">
            <p className="text-sm text-muted">Jumlah kiriman</p>
            <p className="font-display text-5xl leading-none">{jumlah}</p>
            <p className="text-sm text-muted">
              {jumlah === 0 ? "Belum ada jawaban tersimpan." : "Jawaban tersimpan di server."}
            </p>
            {rows && rows.length > 0 ? (
              <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                {rows.map((r) => (
                  <li key={r.id} className="px-4 py-3 text-[14px]">
                    <p className="font-medium">
                      {r.nama?.trim() || "(tanpa nama)"}
                      {r.institusi?.trim() ? (
                        <span className="font-normal text-muted"> · {r.institusi}</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {r.created_at}
                      {r.versi ? ` · ${r.versi}` : ""} · {r.id}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <p className="text-[13px] leading-relaxed text-muted">
          Catatan: tanpa <code className="rounded bg-line/60 px-1">DATABASE_URL</code> (Neon), data
          memakai PGLite di memori server dan hilang saat server di-restart. Untuk workshop yang
          jawaban harus bertahan, deploy dengan database.
        </p>
      </main>
    </div>
  );
}
