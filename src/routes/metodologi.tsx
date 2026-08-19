import { createFileRoute, Link } from "@tanstack/react-router";
import { DISCIPLINES, HAZARDS } from "@/lib/types";
import {
  DEFAULT_WEIGHTS,
  DISCIPLINE_LABEL,
  HAZARD_LABEL,
} from "@/lib/weights";

export const Route = createFileRoute("/metodologi")({ component: Metodologi });

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
        <Link to="/" className="text-sm text-muted hover:text-ink">
          ← Peta
        </Link>
        <h1 className="mt-2 font-display text-3xl">Metodologi PKPRB</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Semua rumus di bawah ini adalah yang dijalankan peta. Bukan peta
          kesiapan, ketangguhan, atau kapasitas kelembagaan daerah.
        </p>
      </header>

      <article className="mx-auto max-w-3xl space-y-12 px-4 py-10 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-display text-2xl">Tiga lapisan tampilan</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              <strong>Pendidikan</strong> — IDPKI (Indeks Dukungan Pendidikan
              untuk Ketangguhan Infrastruktur), per juta penduduk.
            </li>
            <li>
              <strong>Risiko</strong> — skor komposit bergaya IRBI atau profil
              per bahaya.
            </li>
            <li>
              <strong>Keselarasan</strong> — matriks 3×3: tertil risiko × tertil
              IDPKI.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-2xl">1. Skor prodi</h2>
          <p className="mt-3">
            Tidak ada toggle. Bobot 0 berarti prodi, jenjang, atau akreditasi
            itu tidak dihitung. Setiap program studi menyumbang:
          </p>
          <Formula>
            {`E_prodi = w(disiplin, bahaya)
        × w(jenjang)
        × w(akreditasi_prodi)`}
          </Formula>
          <h3 className="mt-6 font-display text-xl">Jenjang</h3>
          <p className="mt-3">
            Default sementara sama (1,00) agar sensitivitas disiplin lebih
            mudah dibaca. D4 memakai bobot S1. Geser sliders untuk membedakan
            S2/S3.
          </p>
          <SimpleTable
            head={["Jenjang", "Default"]}
            rows={[
              ["S1 (dan D4)", "1,00"],
              ["S2", "1,00"],
              ["S3", "1,00"],
            ]}
          />
          <h3 className="mt-6 font-display text-xl">Akreditasi prodi</h3>
          <p className="mt-3">
            IABEE (General atau Provisional) dipetakan ke Internasional —
            bukan bonus terpisah, agar tidak dihitung dua kali di atas Unggul.
          </p>
          <SimpleTable
            head={["Peringkat prodi", "Default"]}
            rows={[
              ["Internasional (IABEE)", "1,00"],
              ["Unggul atau A", "0,90"],
              ["Baik Sekali atau B", "0,80"],
              ["Baik, C, atau terakreditasi lain", "0,70"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">2. Bobot disiplin × bahaya</h2>
          <p className="mt-3">
            <em>w</em> adalah prior Delphi (0–1). Nilai default mengikuti jenis
            bahaya yang dipilih; sliders di peta menimpa nilai ini secara
            langsung. Sipil tinggi pada gempa dan likuefaksi; Planologi lebih tinggi
            pada tsunami dan banjir; geologi tinggi pada longsor dan gunung api;
            kelautan tinggi pada tsunami.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[720px] w-full text-left text-[12px]">
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
                {HAZARDS.map((h) => (
                  <tr key={h} className="border-t border-line">
                    <td className="px-3 py-1.5">{HAZARD_LABEL[h]}</td>
                    {DISCIPLINES.map((d) => (
                      <td key={d} className="px-2 py-1.5 tabular-nums">
                        {DEFAULT_WEIGHTS[h][d].toFixed(2)}
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
            Slider “Keberadaan pusat studi” (w_pusat, default 1) mengali seluruh
            kontribusi penelitian. Nol berarti pusat studi tidak dihitung.
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
            Dipisah dari penelitian. Hanya pusat yang punya rekam PkM /
            layanan kepakaran. Slider w_kepakaran default 1.
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
            peringkat prodi. Prodi Unggul di kampus Baik tidak memancar ke
            pulau lain. Slider w_spill (default 1) menaik-turunkan semua
            persentase. Provinsi asal tetap menerima 100% skornya.
          </p>
          <p className="mt-3">
            Prototipe institusi internasional: ITB, UI, UGM, ITS. Unggul
            institusi dikurasi; lainnya diinfer dari peringkat program.
          </p>
          <Formula>
            {`pulau sama, PT internasional : 12% × w_spill × skor
pulau sama, PT unggul         :  8% × w_spill × skor
pulau sama, PT baik sekali    :  4% × w_spill × skor
pulau sama, PT baik           :  0
pulau lain, PT internasional  :  6% × w_spill × skor
pulau lain, PT unggul         :  3% × w_spill × skor
pulau lain, selain itu        :  0`}
          </Formula>
        </section>

        <section>
          <h2 className="font-display text-2xl">6. Kapasitas dan IDPKI</h2>
          <Formula>
            {`Kapasitas = Σ E_prodi + Σ R_pusat + Σ K_kepakaran
           (masing-masing termasuk spillover)

IDPKI = Kapasitas / (jumlah penduduk / 1.000.000)`}
          </Formula>
          <p className="mt-3">
            Normalisasi per juta penduduk mencegah Jawa otomatis “tinggi”
            hanya karena jumlah kampus. Tab <em>Pendidikan</em> mewarnai
            provinsi menurut IDPKI (krem → teal).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">7. Risiko</h2>
          <p className="mt-3">
            Skor komposit dikalibrasi ke angka publik IRBI 2024: Maluku 161,5;
            Maluku Utara 145,09; DKI Jakarta 59,29. Skor per bahaya (gempabumi,
            tsunami, banjir, longsor, likuefaksi, gunung api, karhutla) bersifat
            relatif untuk prototipe — bukan salinan sel resmi IRBI/BNPB.
          </p>
          <p className="mt-3">
            Tab <em>Risiko</em> mewarnai min–maks di antara 38 provinsi (krem →
            terracotta) pada bahaya yang sedang dipilih.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">8. Tertil dan matriks 3×3</h2>
          <p className="mt-3">
            Kelas 0 / 1 / 2 dihitung ulang setiap kali parameter berubah, dari
            kuantil empiris 38 provinsi:
          </p>
          <Formula>
            {`kelas = 0  jika nilai ≤ kuantil 1/3
      = 1  jika nilai ≤ kuantil 2/3
      = 2  jika di atas itu`}
          </Formula>
          <p className="mt-3">
            Sumbu tegak: tertil risiko (atas = tinggi). Sumbu datar: tertil
            IDPKI / pendidikan (kanan = tinggi). Empat sudut:
          </p>
          <SimpleTable
            head={["Risiko", "Pendidikan", "Kuadran"]}
            rows={[
              ["tinggi (2)", "rendah (0)", "Senjang"],
              ["tinggi (2)", "tinggi (2)", "Selaras"],
              ["rendah (0)", "tinggi (2)", "Berlebih"],
              ["rendah (0)", "rendah (0)", "Relevan"],
              ["lainnya", "lainnya", "Menengah"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">9. Indeks senjang (prioritas)</h2>
          <p className="mt-3">
            Footer peta mengurutkan enam provinsi dengan senjang terbesar.
            Risiko dan IDPKI dinormalisasi min–maks ke 0–1, lalu:
          </p>
          <Formula>
            {`risiko_norm = (R − min R) / (max R − min R)
IDPKI_norm  = (E − min E) / (max E − min E)

senjang = risiko_norm − IDPKI_norm`}
          </Formula>
          <p className="mt-3">
            Nilai mendekati +1: risiko relatif tinggi, pendidikan relatif
            rendah. Nilai negatif: pendidikan relatif lebih tinggi daripada
            risiko.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">Sumber data prototipe</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>90 prodi S1 Teknik Sipil (BAN-PT / LAM Teknik).</li>
            <li>14 prodi kebencanaan (BAN-PT).</li>
            <li>
              Kurasi awal: 13 Planologi, 10 geologi, 8 arsitektur, 8
              lingkungan, 8 kelautan, 9 multidisiplin — bukan direktori BAN-PT
              lengkap; geser bobot ke 0 untuk mematikannya.
            </li>
            <li>
              13 pusat studi kebencanaan, sekaligus proxy layanan kepakaran
              (TDMRC USK, PSB Unand, PSBA UGM, RCDM ITB, PUI Gambut Unri,
              Nalodo Untad, dan lainnya).
            </li>
            <li>
              Akreditasi institusi: prototipe (4 internasional; sisanya Unggul /
              Baik Sekali / Baik).
            </li>
            <li>Penduduk: angka prototipe per provinsi (38, termasuk pemekaran Papua).</li>
            <li>Batas administrasi GeoJSON 38 provinsi.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl">Yang tidak diklaim</h2>
          <p className="mt-3">
            PKPRB tidak mengukur kesiapsiagaan BPBD, kepatuhan SNI, stok
            insinyur di lapangan, atau mutu lulusan. Bobot disiplin × bahaya
            adalah prior yang dapat digeser. Inventaris prodi dan pusat studi
            perlu validasi berkala. Angka IRBI komposit dikalibrasi ke publikasi
            2024, bukan unduhan resmi per kabupaten.
          </p>
          <p className="mt-3 text-sm text-muted">
            Terkait P2MI Multidisiplin FTSL ITB 2026, Mainstreaming Disaster
            Resiliency in Infrastructure Systems.
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
