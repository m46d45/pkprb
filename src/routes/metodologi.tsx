import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";

export const Route = createFileRoute("/metodologi")({
  component: MetodologiPage,
  head: () => ({
    meta: [
      {
        title: "Metodologi — PKPRB",
      },
      {
        name: "description",
        content:
          "Rumus skor, IRBI 2025 komposit, matriks 3×3, dan sumber data Peta Keselarasan Pendidikan dan Risiko Bencana.",
      },
    ],
  }),
});

function MetodologiPage() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-sm hover:border-ink"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke peta
          </Link>
          <span className="font-display text-lg">Metodologi PKPRB</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            28 Agustus 2026 · P2MI Multidisiplin FTSL ITB
          </p>
          <h1 className="font-display text-3xl leading-tight">
            Peta Keselarasan Pendidikan dan Risiko Bencana
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            PKPRB memetakan keselarasan antara risiko bencana provinsi dan
            dukungan perguruan tinggi (prodi, pusat studi, pengabdian
            terlembaga). Bukan peta kesiapan BPBD, stok insinyur, atau mutu
            lulusan di lapangan.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <a
            href="/Template-Data-PKPRB.xlsx"
            download
            className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 transition hover:border-ink"
          >
            <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-teal" />
            <div>
              <p className="font-medium">Template data (Excel)</p>
              <p className="mt-0.5 text-sm text-muted">
                204 prodi, 17 pusat, 50 peristiwa, 38 komposit IRBI 2025.
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal">
                <Download className="size-3.5" /> Unduh .xlsx
              </p>
            </div>
          </a>
          <a
            href="/Metodologi-PKPRB.docx"
            download
            className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 transition hover:border-ink"
          >
            <FileText className="mt-0.5 size-5 shrink-0 text-teal" />
            <div>
              <p className="font-medium">Metodologi lengkap (Word)</p>
              <p className="mt-0.5 text-sm text-muted">
                Rumus, IRBI 2025 komposit saja, bobot, spillover, dan batas klaim.
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal">
                <Download className="size-3.5" /> Unduh .docx
              </p>
            </div>
          </a>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl">Cara membaca peta</h2>
          <ul className="space-y-3 text-[15px] leading-relaxed">
            <li>
              <strong>Risiko / Bahaya</strong> — koropleth dari{" "}
              <em>satu</em> angka: indeks komposit IRBI 2025 BNPB (buku
              InaRISK). Skala tampilan 1–10 dengan cap 250 (Papua Barat Daya
              230,78 tidak terpotong). Filter jenis bahaya{" "}
              <em>tidak</em> mengganti warna risiko.
            </li>
            <li>
              <strong>Pendidikan</strong> — 1–10 dari{" "}
              <code className="rounded bg-line/60 px-1 text-[13px]">
                ln(1 + kapasitas)
              </code>
              . Kapasitas = Σ skor prodi + pusat + kepakaran (bendera PkM) +
              spillover. Penduduk tidak dibagi pada skala ini.
            </li>
            <li>
              <strong>Keselarasan</strong> — matriks 3×3 tertil risiko komposit
              × tertil pendidikan di 38 provinsi. Label: Senjang, Selaras,
              Berlebih, Relevan, Menengah.
            </li>
            <li>
              <strong>Historis</strong> — 1–10 dari{" "}
              <code className="rounded bg-line/60 px-1 text-[13px]">
                ln(1 + korban jiwa absolut)
              </code>{" "}
              sejak 2000 (katalog kurasi, bukan DIBI). Cap visual{" "}
              <code className="rounded bg-line/60 px-1 text-[13px]">ln(1+5000)</code>.
            </li>
            <li>
              <strong>Pusat</strong> — massa pusat studi + kepakaran di
              provinsi itu, tanpa prodi dan tanpa spillover.
            </li>
            <li>
              <strong>Respons</strong> — 3×3 historis × pusat: responsif,
              antisipatif, tidak melembaga, belum terespons, menengah.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl">Filter jenis bahaya</h2>
          <p className="text-[15px] leading-relaxed">
            Filter gempa, tsunami, banjir, dan seterusnya adalah{" "}
            <strong>lensa kapasitas</strong>, bukan lensa IRBI. Yang berubah:
            matriks bobot disiplin, kecocokan bahaya pusat studi, dan daftar
            peristiwa historis. Yang tidak berubah: warna layer Risiko dan
            sumbu risiko pada Keselarasan — keduanya tetap komposit IRBI 2025.
          </p>
          <p className="text-[15px] leading-relaxed text-muted">
            Buku IRBI 2025 tidak menerbitkan skor ancaman tingkat provinsi.
            Rincian per jenis hanya ada di peringkat kabupaten (hlm. 212–375).
            Kolom per-bahaya di template Excel adalah sisa prototipe dan tidak
            dipakai peta.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl">Ringkasan rumus</h2>
          <div className="space-y-3 text-[15px] leading-relaxed">
            <p>
              <strong>1. Skor prodi</strong> = bobot disiplin (matriks bahaya
              yang sedang dipilih) × bobot jenjang × bobot akreditasi. IABEE
              General atau Provisional dihitung sebagai Internasional, tidak
              ditumpuk di atas Unggul.
            </p>
            <p>
              <strong>2. Pusat</strong> = bobot pusat × kematangan (anchor 1,35 /
              PUI 1,20 / standard 1,00) × jejaring nasional 1,20 × kecocokan
              bahaya (1,00 cocok; 0,20 jika filter bahaya lain).
            </p>
            <p>
              <strong>3. Kepakaran</strong> = bobot kepakaran × bendera PkM pada
              baris pusat. Sheet layanan aktivitas (04) ditunda — tidak masuk
              skor.
            </p>
            <p>
              <strong>4. Spillover</strong> mengikuti akreditasi institusi, bukan
              prodi. Kolam sepulau / nasional dibagi rata ke penerima, tidak
              digandakan. PT dengan akreditasi Baik tidak memancar.
            </p>
            <p>
              <strong>5. Tertil</strong> dihitung di antara 38 provinsi (33% /
              67%) untuk Keselarasan dan Respons.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">Isi basis saat ini</h2>
          <ul className="list-inside list-disc space-y-1.5 text-[15px] text-muted">
            <li>38 komposit IRBI 2025 (buku InaRISK); cap tampilan 250.</li>
            <li>
              204 program studi (BAN-PT / LAM Teknik–SAKTI / IABEE / laman PT).
              Prioritas S2/S3 luar Jawa pada sipil, planologi, geologi,
              lingkungan, kebencanaan.
            </li>
            <li>
              17 pusat studi terverifikasi nama. Lubang disengaja: Papua
              (kecuali Uncen sebagai prodi, bukan pusat), NTT, Malut, sebagian
              besar Kalimantan.
            </li>
            <li>
              50 peristiwa historis dengan korban jiwa (BNPB / EM-DAT / berita
              resmi), termasuk Flores 2026 dan banjir Sumatera 2025.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-line bg-surface p-4 text-[14px] leading-relaxed text-muted">
          <p className="font-medium text-ink">Batas klaim</p>
          <p className="mt-1">
            Matriks disiplin–bahaya adalah prior kerja, bukan regresi. Inventaris
            bukan direktori nasional lengkap. Historis bukan DIBI. Karhutla
            understated (hanya korban langsung). Akreditasi dan pusat berubah;
            pemutakhiran masih lewat template Excel.
          </p>
        </section>

        <footer className="border-t border-line pt-6 pb-10 text-sm text-muted">
          <p>
            P2MI Multidisiplin FTSL ITB 2026 —{" "}
            <em>Mainstreaming Disaster Resiliency in Infrastructure Systems</em>.
          </p>
          <p className="mt-2">
            <Link to="/" className="text-teal underline-offset-2 hover:underline">
              ← Kembali ke peta interaktif
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
