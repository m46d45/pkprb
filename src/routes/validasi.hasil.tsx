import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

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
        content: "Unduh jawaban JSON validator (fasilitator saja).",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ValidasiHasilPage() {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem("pkprb-validasi-token") ?? "";
    } catch {
      return "";
    }
  });
  const [rows, setRows] = useState<Ringkas[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function muat() {
    setBusy(true);
    setError(null);
    try {
      sessionStorage.setItem("pkprb-validasi-token", token);
      const res = await fetch(
        `/api/validasi?token=${encodeURIComponent(token)}`,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
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
        setError(data.error ?? `Gagal (${res.status})`);
        return;
      }
      setRows(
        (data.jawaban ?? []).map((j) => ({
          id: j.id,
          created_at: j.created_at,
          versi: j.versi,
          nama: j.nama,
          institusi: j.institusi,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setRows(null);
    } finally {
      setBusy(false);
    }
  }

  function unduhSemua() {
    const a = document.createElement("a");
    a.href = `/api/validasi?token=${encodeURIComponent(token)}&download=1`;
    a.download = `pkprb-validasi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
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
          <h1 className="font-display text-3xl leading-tight">
            Unduh jawaban validator
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Halaman fasilitator. Validator hanya menekan{" "}
            <strong className="text-ink">Kirim isian</strong> di form; Anda yang
            unduh JSON kapan saja dari sini.
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
              className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px]"
              placeholder="Token unduh"
            />
          </label>
          <p className="text-[13px] text-muted">
            Token bersama fasilitator (default):{" "}
            <code className="rounded bg-line/60 px-1">12345678</code>. Boleh diganti lewat
            env <code className="rounded bg-line/60 px-1">VALIDASI_EXPORT_TOKEN</code>.
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
              disabled={!token.trim() || !rows || rows.length === 0}
              onClick={unduhSemua}
              className="rounded-md border border-line bg-paper px-3.5 py-2 text-sm font-medium hover:border-ink disabled:opacity-50"
            >
              Unduh semua JSON
            </button>
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        {rows ? (
          <section className="space-y-3">
            <p className="text-sm text-muted">
              {rows.length === 0
                ? "Belum ada jawaban tersimpan."
                : `${rows.length} jawaban tersimpan.`}
            </p>
            {rows.length > 0 ? (
              <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                {rows.map((r) => (
                  <li key={r.id} className="px-4 py-3 text-[14px]">
                    <p className="font-medium">
                      {r.nama?.trim() || "(tanpa nama)"}
                      {r.institusi?.trim() ? (
                        <span className="font-normal text-muted">
                          {" "}
                          · {r.institusi}
                        </span>
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
          Catatan: tanpa <code className="rounded bg-line/60 px-1">DATABASE_URL</code>{" "}
          (Neon), data memakai PGLite di memori server dan hilang saat server
          di-restart. Untuk workshop yang jawaban harus bertahan, deploy dengan
          database.
        </p>
      </main>
    </div>
  );
}
