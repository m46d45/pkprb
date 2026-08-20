import { createFileRoute, Link } from "@tanstack/react-router";
import { centers } from "@/data/centers";
import { DISCIPLINES, STRATA_LEVELS } from "@/lib/types";
import type { HazardId } from "@/lib/types";
import {
  DEFAULT_ACC,
  DEFAULT_STRATA,
  DEFAULT_WEIGHTS,
  DISCIPLINE_LABEL,
  HAZARD_LABEL,
  STRATA_LABEL,
} from "@/lib/weights";

export const Route = createFileRoute("/metodologi")({
  component: Metodologi,
  head: () => ({
    meta: [
      {
        title: "Metodologi PKPRB — Peta Keselarasan Pendidikan dan Risiko Bencana",
      },
    ],
  }),
});

const HAZARD_ROWS: HazardId[] = [
  "gempa",
  "tsunami",
  "banjir",
  "longsor",
  "likuefaksi",
  "gunungapi",
  "karhutla",
  "composite",
];

function dec(n: number) {
  return n.toFixed(2).replace(".", ",");
}

function Formula({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-surface px-4 py-3 font-mono text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function Metodologi() {
  return (
    <main className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-surface px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-tight no-underline">
            <img src="/favicon.svg?v=2" alt="" width={28} height={28} className="size-7 rounded-md" />
            PKPRB
          </Link>
          <Link
            to="/"
            className="rounded-md border border-line px-3 py-1.5 text-[13px] hover:border-ink"
          >
            ← Buka peta
          </Link>
        </div>
        <div className="mx-auto mt-6 max-w-3xl">
          <p className="text-[11px] tracking-wide text-muted uppercase">
            Prototipe · 20 Agustus 2026 · P2MI Multidisiplin FTSL ITB
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight">
            Metodologi PKPRB
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
            Peta Keselarasan Pendidikan dan Risiko Bencana. Dokumen ini
            menjelaskan rumus yang benar-benar dijalankan peta, supaya tim
            dapat meninjau asumsi, bobot, dan celah data.{" "}
            <a href="/Metodologi-PKPRB.docx" className="text-ink underline underline-offset-2">
              Unduh versi Word
            </a>
            {" · "}
            <a href="/Template-Data-PKPRB.xlsx" className="text-ink underline underline-offset-2">
              Template data Excel
            </a>
            .
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-3xl space-y-12 px-4 py-10 text-[15px] leading-relaxed">
        <aside className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
          <p className="font-medium">Bukan peta kesiapan atau ketangguhan daerah.</p>
          <p className="mt-1 text-muted">
            PKPRB memetakan keselarasan antara profil risiko dan dukungan
            pendidikan tinggi (prodi, penelitian, pengabdian). Tidak mengukur
            BPBD, SNI, stok insinyur, atau mutu lulusan di lapangan.
          </p>
        </aside>

        <section>
          <h2 className="font-display text-2xl">Masukan yang kami butuhkan</h2>
          <p className="mt-3 text-muted">
            Silakan uji peta lalu komentari butir berikut. Geser sliders: peta
            dan rumus ini sama.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>
              Matriks bobot disiplin × bahaya (prior Delphi). Apakah sipil
              harus 1,00 di gempa? Apakah Planologi 0,40 terlalu rendah?
            </li>
            <li>
              Jenjang S1/S2/S3 default semua 1,00. Perlukah S2/S3 lebih tinggi?
            </li>
            <li>
              IABEE dipetakan ke akreditasi Internasional, bukan bonus di atas
              Unggul. Setuju?
            </li>
            <li>
              Hanya ITB, UI, UGM, ITS yang disebut PT internasional untuk
              spillover. Tambah IPB, Unpad, Unhas, atau lainnya?
            </li>
            <li>
              Besaran kolam spillover 12 / 8 / 4% sepulau dan 6 / 3%
              antar-pulau, dibagi rata ke penerima. Arahnya sudah benar?
            </li>
            <li>
              Skala tampilan 1–10 untuk Pendidikan dan Risiko (bukan min–maks
              38 provinsi). Keselarasan tetap 3×3. Cukup intuitif?
            </li>
            <li>
              Inventaris Planologi, geologi, arsitektur, lingkungan, kelautan,
              multidisiplin masih kurasi awal — bukan direktori BAN-PT lengkap.
            </li>
            <li>
              Label kuadran: Senjang, Selaras, Berlebih, Relevan.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-2xl">Cara membaca peta</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              <strong>Pendidikan</strong> — skala tampilan 1–10 dari
              ln(1 + kapasitas). Penduduk tidak dibagi. 1 = kapasitas nol;
              10 = ln(1+kapasitas) ≥ 4.
            </li>
            <li>
              <strong>Risiko</strong> — skala tampilan 1–10. Bahaya tunggal
              dari skor 0–100; komposit dari IRBI 0–200.
            </li>
            <li>
              <strong>Keselarasan</strong> — matriks 3×3 tertil risiko × tertil
              pendidikan di antara 38 provinsi. Tidak dipaksa jadi satu angka.
              Tooltip memakai kedua nilai 1–10.
            </li>
            <li>
              <strong>Historis</strong> — bubble korban jiwa kejadian
              signifikan sejak 2000 (kurasi, bukan DIBI lengkap). Besar–kecil
              mengikuti ln(korban).
            </li>
            <li>
              <strong>Pusat</strong> — massa pusat studi + PkM di provinsi
              itu (tanpa prodi, tanpa spillover). Skala 1–10.
            </li>
            <li>
              <strong>Respons</strong> — matriks 2×2 historis × pusat.
              Belum terespons + risiko tinggi = celah roadmap.
            </li>
          </ol>
          <p className="mt-3">
            Contoh pada bahaya gempabumi, bobot default (dibulatkan):
          </p>
          <SimpleTable
            head={["Provinsi", "Pendidikan (1–10)", "Risiko gempa (1–10)", "Catatan"]}
            rows={[
              ["DI Yogyakarta", "8,3", "8,6", "Kapasitas ~24; selaras"],
              ["Jawa Barat", "8,2", "7,5", "Kapasitas hampir sama dengan Yogya"],
              ["Aceh", "6,6", "9,1", "TDMRC + banyak prodi"],
              ["Papua", "3,3", "7,8", "Sedikit prodi"],
              ["Papua Selatan", "2,5", "6,0", "Satu S1 Musamus"],
              ["Maluku", "2,7", "8,9", "Risiko tinggi, pendidikan rendah"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">1. Skor prodi</h2>
          <p className="mt-3">
            Tidak ada toggle. Bobot 0 = tidak dihitung. Setiap program studi:
          </p>
          <Formula>
            {`E_prodi = w(disiplin, bahaya)
        × w(jenjang)
        × w(akreditasi_prodi)`}
          </Formula>
          <h3 className="mt-6 font-display text-xl">Jenjang</h3>
          <p className="mt-3">
            Default sementara sama, agar perbedaan antar-disiplin mudah dibaca.
            D4 memakai bobot S1.
          </p>
          <SimpleTable
            head={["Jenjang", "Default"]}
            rows={STRATA_LEVELS.map((s) => [
              s === "S1" ? "S1 (dan D4)" : STRATA_LABEL[s],
              dec(DEFAULT_STRATA[s]),
            ])}
          />
          <h3 className="mt-6 font-display text-xl">Akreditasi prodi</h3>
          <p className="mt-3">
            IABEE General atau Provisional → Internasional. Tidak ditumpuk di
            atas Unggul.
          </p>
          <SimpleTable
            head={["Peringkat prodi", "Default"]}
            rows={[
              ["Internasional (IABEE)", dec(DEFAULT_ACC.internasional)],
              ["Unggul atau A", dec(DEFAULT_ACC.unggul)],
              ["Baik Sekali atau B", dec(DEFAULT_ACC["baik-sekali"])],
              ["Baik, C, atau terakreditasi lain", dec(DEFAULT_ACC.baik)],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">2. Bobot disiplin × bahaya</h2>
          <p className="mt-3">
            Prior 0–1, berganti otomatis saat jenis bahaya dipilih, lalu dapat
            digeser. Sipil tinggi pada gempa dan likuefaksi; Planologi pada
            tsunami dan banjir; geologi pada longsor dan gunung api; kelautan
            pada tsunami.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[760px] w-full text-left text-[12px]">
              <thead className="bg-surface">
                <tr>
                  <th className="px-3 py-2 font-medium">Bahaya</th>
                  {DISCIPLINES.map((d) => (
                    <th key={d} className="px-2 py-2 font-medium">
                      {DISCIPLINE_LABEL[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HAZARD_ROWS.map((h) => (
                  <tr key={h} className="border-t border-line">
                    <td className="px-3 py-1.5">{HAZARD_LABEL[h]}</td>
                    {DISCIPLINES.map((d) => (
                      <td key={d} className="px-2 py-1.5 tabular-nums">
                        {dec(DEFAULT_WEIGHTS[h][d])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">3. Penelitian: pusat studi</h2>
          <p className="mt-3">
            Slider w_pusat (default 1). Nol = pusat studi tidak dihitung.
          </p>
          <Formula>
            {`R_pusat = w_pusat × 1,35 × kematangan × kesesuaian × nasional`}
          </Formula>
          <SimpleTable
            head={["Faktor", "Nilai"]}
            rows={[
              ["Kematangan: anchor (TDMRC, PSBA, RCDM, PSB Unand, Nalodo)", "1,35"],
              ["Kematangan: PUI", "1,20"],
              ["Kematangan: standar", "1,00"],
              ["Bahaya cocok, atau mode komposit", "1,00"],
              ["Bahaya tidak tercantum di fokus pusat", "0,20"],
              ["Pusat berjejaring nasional", "1,20"],
              ["Pusat lokal", "1,00"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">4. Pengabdian: layanan kepakaran</h2>
          <p className="mt-3">
            Dipisah dari penelitian. Hanya pusat yang punya rekam PkM. Slider
            w_kepakaran default 1. Basis data masih proxy dari pusat studi,
            bukan direktori layanan kepakaran tersendiri.
          </p>
          <Formula>
            {`K_kepakaran = w_kepakaran × 1,10 × kematangan × kesesuaian`}
          </Formula>
          <SimpleTable
            head={["Kematangan", "Pengali"]}
            rows={[
              ["Anchor", "1,20"],
              ["PUI", "1,10"],
              ["Standar", "1,00"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">5. Spillover antarprovinsi</h2>
          <p className="mt-3">
            Mengikuti <strong>akreditasi perguruan tinggi</strong>, bukan
            peringkat prodi. Provinsi asal tetap 100% skornya. Sebagian kecil
            dipancarkan sebagai <em>kolam</em> lalu dibagi rata ke penerima —
            tidak dikloning ke setiap provinsi. (Kloning membuat Papua Selatan
            tampak “tinggi” hanya karena penduduknya 522 ribu, padahal hampir
            seluruh angkanya impor dari ITB/UI/UGM/ITS.) Slider w_spill
            (default 1) menaik-turunkan kolam.
          </p>
          <SimpleTable
            head={["Akreditasi PT", "Pulau yang sama", "Pulau lain"]}
            rows={[
              ["Internasional (ITB, UI, UGM, ITS)", "12% kolam ÷ n sepulau", "6% kolam ÷ n pulau lain"],
              ["Unggul", "8% kolam ÷ n sepulau", "3% kolam ÷ n pulau lain"],
              ["Baik Sekali", "4% kolam ÷ n sepulau", "0"],
              ["Baik", "0", "0"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">6. Kapasitas dan indeks Pendidikan</h2>
          <Formula>
            {`Kapasitas = Σ E_prodi + Σ R_pusat + Σ K_kepakaran
           + spillover masuk (kolam sumber ÷ jumlah penerima)

P_ln = ln(1 + Kapasitas)
per_juta = Kapasitas / (jumlah penduduk / 1.000.000)   (panel, bukan warna peta)

Pendidikan_tampil = 1 + 9 × min(1, P_ln / 4)`}
          </Formula>
          <p className="mt-3">
            Peta Pendidikan mewarnai massa akademik, bukan kepadatan per
            kapita. ln meredam pencilan tanpa membuang urutan: Yogya ≈ Jabar
            (kapasitas ~24 → sekitar 8 dari 10), Papua Selatan (satu S1 →
            sekitar 2). Per juta, kapasitas, dan skor bahaya mentah tetap di
            panel. Warna dan tooltip memakai skala 1–10.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">7. Risiko</h2>
          <p className="mt-3">
            Komposit dikalibrasi ke angka publik IRBI 2024: Maluku 161,5;
            Maluku Utara 145,09; DKI Jakarta 59,29. Skor per bahaya (gempabumi,
            tsunami, banjir, longsor, likuefaksi, gunung api, karhutla) adalah
            profil relatif prototipe — bukan sel resmi IRBI/BNPB.
          </p>
          <p className="mt-3">
            Warna dan angka Risiko di peta memakai skala 1–10. Skor mentah
            IRBI tetap di panel.
          </p>
          <Formula>
            {`Risiko_tampil = 1 + 9 × min(1, R / R_cap)
R_cap = 100  (bahaya tunggal)
      = 200  (komposit)`}
          </Formula>
        </section>

        <section>
          <h2 className="font-display text-2xl">8. Tertil dan matriks 3×3</h2>
          <p className="mt-3">
            Kelas 0 / 1 / 2 dihitung ulang setiap kali parameter berubah, dari
            kuantil empiris 38 provinsi (ini perbandingan relatif, sengaja):
          </p>
          <Formula>
            {`kelas = 0  jika nilai ≤ kuantil 1/3
      = 1  jika nilai ≤ kuantil 2/3
      = 2  jika di atas itu`}
          </Formula>
          <p className="mt-3">
            Tegak: tertil risiko (atas = tinggi). Datar: tertil pendidikan
            (kanan = tinggi).
          </p>
          <SimpleTable
            head={["Risiko", "Pendidikan", "Kuadran", "Arti singkat"]}
            rows={[
              ["tinggi", "rendah", "Senjang", "Prioritas intervensi pendidikan"],
              ["tinggi", "tinggi", "Selaras", "Simpul yang sudah sepadan"],
              ["rendah", "tinggi", "Berlebih", "Kapasitas lebih dari bebannya"],
              ["rendah", "rendah", "Relevan", "Sebanding pada beban kecil"],
              ["menengah", "menengah", "Menengah", "Bukan sudut matriks"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">9. Indeks senjang</h2>
          <p className="mt-3">
            Footer peta mengurutkan enam provinsi dengan senjang terbesar.
            Untuk ranking ini, risiko dan pendidikan (nilai internal: skor
            bahaya dan P_ln) dinormalisasi min–maks 38 provinsi ke 0–1.
            Skala 1–10 monoton terhadap nilai itu, jadi urutan sama.
          </p>
          <Formula>
            {`risiko_norm = (R − min R) / (max R − min R)
P_norm      = (P_ln − min P_ln) / (max P_ln − min P_ln)

senjang = risiko_norm − P_norm`}
          </Formula>
          <p className="mt-3">
            Mendekati +1: risiko relatif tinggi, pendidikan relatif rendah.
            Negatif: pendidikan relatif lebih tinggi daripada risiko.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">10. Historis, pusat, dan respons</h2>
          <p className="mt-3">
            Tiga tampilan ini memilah penelitian/PkM yang <em>mengikuti
            luka</em> dari yang <em>mendahului kejadian</em> — bahan roadmap
            riset, bukan preparedness. Prodi tetap di Pendidikan/Keselarasan.
            Pusat di peta Respons = stok lokal (spillover tidak dihitung).
          </p>
          <p className="mt-3">
            Historis: korban jiwa kejadian signifikan 2000–kini, kurasi
            publik (bukan DIBI lengkap). Satu peristiwa dihitung sekali pada
            komposit; pada bahaya tunggal jika tercantum di daftar bahayanya.
            Karhutla understated (korban langsung, bukan excess death haze).
          </p>
          <Formula>
            {`kelas_historis = 1 jika korban > median 38 provinsi, else 0
kelas_pusat    = 1 jika (R_pusat + K_kepakaran)_lokal > median, else 0`}
          </Formula>
          <SimpleTable
            head={["Historis", "Pusat", "Kuadran", "Arti"]}
            rows={[
              ["tinggi", "tinggi", "Responsif", "Kapasitas setelah peristiwa (TDMRC, PSBA, Nalodo)"],
              ["rendah", "tinggi", "Antisipatif", "Pusat tanpa pemicu lokal — yang ingin ditiru"],
              ["tinggi", "rendah", "Tidak melembaga", "Terjadi, kelembagaan tidak menempel"],
              ["rendah", "rendah", "Belum terespons", "Jika risiko tinggi: celah roadmap"],
            ]}
          />
          <p className="mt-3">
            Footer pada tab Respons mengurutkan “belum terespons + risiko
            tinggi”. Ini bukan peta kesiapan; ini daftar wilayah yang
            risikonya tinggi, memorinya kosong, dan pusatnya belum ada.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">Sumber data prototipe</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>90 prodi S1 Teknik Sipil (BAN-PT / LAM Teknik).</li>
            <li>14 prodi kebencanaan (BAN-PT).</li>
            <li>
              Kurasi awal: 13 Planologi, 10 geologi, 8 arsitektur, 8
              lingkungan, 8 kelautan, 9 multidisiplin.
            </li>
            <li>
              13 pusat studi, sekaligus proxy layanan kepakaran (daftar di
              bawah).
            </li>
            <li>
              Akreditasi institusi: prototipe. Internasional = ITB, UI, UGM,
              ITS; Unggul dikurasi; sisanya diinfer dari peringkat program.
            </li>
            <li>Penduduk: angka prototipe, 38 provinsi termasuk pemekaran Papua.</li>
            <li>
              Katalog 45 kejadian signifikan 2000–2024 (korban jiwa, kurasi
              BNPB/EM-DAT/laporan publik) — bukan unduhan DIBI.
            </li>
            <li>Batas administrasi GeoJSON 38 provinsi.</li>
          </ul>
          <h3 className="mt-6 font-display text-xl">Pusat studi dalam basis</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px]">
            {centers.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.name}</span>
                {` — ${c.university} (${c.province}). ${c.focus}`}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl">Yang tidak diklaim</h2>
          <p className="mt-3">
            PKPRB bukan indeks kesiapsiagaan, bukan ranking kampus, dan bukan
            unduhan resmi IRBI per kabupaten. Bobot dapat digeser; hasil
            berubah. Inventaris prodi non-sipil dan akreditasi institusi
            perlu validasi BAN-PT. Skor bahaya selain komposit bersifat
            profil kerja, bukan angka BNPB.
          </p>
          <p className="mt-4 text-sm text-muted">
            P2MI Multidisiplin FTSL ITB 2026 — Mainstreaming Disaster
            Resiliency in Infrastructure Systems. Peta:{" "}
            <a href="https://pkprb.vercel.app">pkprb.vercel.app</a>
            {" · "}
            dokumen ini:{" "}
            <a href="https://pkprb.vercel.app/metodologi">
              pkprb.vercel.app/metodologi
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}

function SimpleTable({
  head,
  rows,
}: {
  head: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-surface">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-line">
              {row.map((c, j) => (
                <td key={j} className="px-3 py-1.5">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

