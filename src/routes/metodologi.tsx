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
          "Rumus skor, skala tampilan, matriks 3×3, dan sumber data Peta Keselarasan Pendidikan dan Risiko Bencana.",
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
            Prototipe · 20 Agustus 2026 · P2MI Multidisiplin FTSL ITB
          </p>
          <h1 className="font-display text-3xl leading-tight">
            Peta Keselarasan Pendidikan dan Risiko Bencana
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Dokumen ini menjelaskan rumus yang dijalankan peta. Bukan peta
            kesiapan, ketangguhan, atau kapasitas kelembagaan daerah — hanya
            keselarasan antara profil risiko dan dukungan pendidikan tinggi
            yang relevan bagi ketangguhan infrastruktur.
          </p>
        </section>

        {/* Download cards */}
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
                Form isian prodi, pusat studi, historis bencana, dll. Termasuk
                45 peristiwa sejak 2000.
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
                Rumus skor, matriks bobot disiplin × bahaya, spillover, dan
                catatan asumsi.
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
              <strong>Pendidikan</strong> — skala tampilan 1–10 dari{" "}
              <code className="rounded bg-line/60 px-1 text-[13px]">
                ln(1 + kapasitas)
              </code>
              . Penduduk tidak dibagi. 1 = kapasitas nol; 10 = kapasitas tertinggi
              pada set data.
            </li>
            <li>
              <strong>Risiko</strong> — skala tampilan 1–10. Bahaya tunggal dari
              skor 0–100; komposit dikalibrasi IRBI 2024 (rentang ≈ 0–200).
            </li>
            <li>
              <strong>Keselarasan</strong> — matriks 3×3 tertil risiko × tertil
              pendidikan di antara 38 provinsi. Label kuadran: Senjang, Selaras,
              Berlebih, Relevan.
            </li>
            <li>
              <strong>Historis</strong> — choropleth 1–10 dari{" "}
              <code className="rounded bg-line/60 px-1 text-[13px]">
                ln(1 + total korban jiwa absolut)
              </code>{" "}
              sejak 2000 (kurasi, bukan DIBI lengkap). Bukan bubble.
            </li>
            <li>
              <strong>Pusat</strong> — massa pusat studi + layanan kepakaran di
              provinsi itu (tanpa prodi, tanpa spillover). Skala 1–10.
            </li>
            <li>
              <strong>Respons</strong> — matriks 3×3 penuh (historis × pusat)
              dengan kategori: responsif, antisipatif, tidak melembaga, belum
              terespons, dan menengah. Dipakai untuk membaca celah roadmap
              penelitian/pengabdian.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl">Ringkasan rumus</h2>
          <div className="space-y-3 text-[15px] leading-relaxed">
            <p>
              <strong>1. Skor prodi</strong> = bobot disiplin (matriks bahaya) ×
              bobot jenjang (S1/S2/S3) × bobot akreditasi (termasuk IABEE →
              Internasional).
            </p>
            <p>
              <strong>2. Kapasitas provinsi</strong> = Σ skor prodi + skor pusat
              studi + skor layanan kepakaran + spillover dari PT sepulau /
              nasional (kolam dibagi rata, tidak digandakan).
            </p>
            <p>
              <strong>3. Skala tampilan</strong> = 1–10 dari ln(1 + nilai), agar
              perbedaan kecil di kapasitas rendah tetap terbaca.
            </p>
            <p>
              <strong>4. Klasifikasi 3 kelas</strong> = tertil (33% / 67%) di
              antara 38 provinsi. Dipakai untuk Keselarasan dan Respons.
            </p>
            <p>
              <strong>5. Historis</strong> = Σ korban jiwa absolut per provinsi
              (dan filter bahaya). Skala dibatasi di sekitar{" "}
              <code className="rounded bg-line/60 px-1 text-[13px]">
                ln(1+5000)
              </code>{" "}
              untuk stabilitas visual.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">Sumber data (prototipe)</h2>
          <ul className="list-inside list-disc space-y-1.5 text-[15px] text-muted">
            <li>IRBI 2024 publik (komposit dikalibrasi; skor per bahaya masih prototipe)</li>
            <li>Inventaris prodi: kurasi BAN-PT / PDDikti / IABEE (bukan direktori lengkap)</li>
            <li>Pusat studi & PkM: laman LPPM, PUI-PT, dan direktori kebencanaan</li>
            <li>
              Historis: kurasi kejadian signifikan 2000–sekarang (BNPB / EM-DAT /
              USGS). Karhutla sering understated (hanya korban langsung).
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-line bg-surface p-4 text-[14px] leading-relaxed text-muted">
          <p className="font-medium text-ink">Catatan penting</p>
          <p className="mt-1">
            Hubungan disiplin–bahaya adalah matriks kerja (prior Delphi), bukan
            hasil regresi. Skor risiko prototipe dikalibrasi ke angka publik IRBI
            2024 tetapi bukan salinan resmi per sel. Data perlu validasi berkala
            — akreditasi berubah, prodi baru muncul, pusat studi berubah status.
            Untuk tahap perencanaan dan roadmap saat ini, update data masih
            manual melalui template Excel.
          </p>
        </section>

        <footer className="border-t border-line pt-6 pb-10 text-sm text-muted">
          <p>
            Proyek terkait P2MI Multidisiplin FTSL ITB 2026 —{" "}
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
