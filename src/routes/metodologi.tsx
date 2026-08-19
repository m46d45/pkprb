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
            Setiap program studi yang aktif (toggle menyala dan bobot
            {` > 0`}) menyumbang:
          </p>
          <Formula>
            {`E_prodi = w(disiplin, bahaya)
        × strata
        × mutu_akreditasi
        × (1 + bonus_IABEE)`}
          </Formula>
          <h3 className="mt-6 font-display text-xl">Strata</h3>
          <SimpleTable
            head={["Strata", "Nilai"]}
            rows={[
              ["S3", "1,00"],
              ["S2", "0,75"],
              ["S1", "0,50"],
              ["D4", "0,40"],
              ["lainnya (default)", "0,50"],
            ]}
          />
          <h3 className="mt-6 font-display text-xl">Mutu akreditasi</h3>
          <SimpleTable
            head={["Peringkat", "Nilai"]}
            rows={[
              ["Unggul atau A", "1,00"],
              ["Baik Sekali atau B", "0,80"],
              ["Baik atau C", "0,60"],
              ["Terakreditasi / lainnya", "0,40"],
            ]}
          />
          <h3 className="mt-6 font-display text-xl">Bonus IABEE</h3>
          <p className="mt-3">
            Hanya jika pengali IABEE dinyalakan. Diterapkan pada prodi teknik
            yang tercatat IABEE di data.
          </p>
          <SimpleTable
            head={["Status", "Bonus"]}
            rows={[
              ["General", "+0,25"],
              ["Provisional", "+0,10"],
              ["Tidak ada / dimatikan", "0"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">2. Bobot disiplin × bahaya</h2>
          <p className="mt-3">
            <em>w</em> adalah prior Delphi (0–1). Nilai default mengikuti jenis
            bahaya yang dipilih; sliders di peta menimpa nilai ini secara
            langsung. Sipil tinggi pada gempa dan likuefaksi; PWK lebih tinggi
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
          <h2 className="font-display text-2xl">3. Skor pusat studi / PkM</h2>
          <p className="mt-3">
            Jika pengali pusat studi dinyalakan, setiap pusat menambah:
          </p>
          <Formula>
            {`R_pusat = 1,35
        × kematangan
        × kesesuaian_bahaya
        × nasional
        × PkM`}
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
              ["Ada PkM", "1,10"],
              ["Tanpa PkM", "1,00"],
            ]}
          />
        </section>

        <section>
          <h2 className="font-display text-2xl">4. Spillover antarprovinsi</h2>
          <p className="mt-3">
            Jika spillover dinyalakan, sebagian skor “tumpah” ke provinsi lain.
            Kampus dianggap nasional jika termasuk ITB, UI, UGM, ITS, atau
            memiliki IABEE General. Pusat studi memakai bendera nasional di
            data.
          </p>
          <Formula>
            {`pulau yang sama, sumber nasional : 10% × skor sumber
pulau yang sama, sumber lokal    :  6% × skor sumber
pulau lain, sumber nasional      :  5% × skor sumber
pulau lain, sumber lokal         :  0`}
          </Formula>
          <p className="mt-3 text-sm text-muted">
            Provinsi asal tetap menerima 100% skornya; spillover bersifat
            tambahan ke tetangga, bukan redistribusi.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">5. Kapasitas dan IDPKI</h2>
          <Formula>
            {`Kapasitas_provinsi = Σ E_prodi (termasuk spillover)
                    + Σ R_pusat (termasuk spillover)

IDPKI = Kapasitas / (jumlah penduduk / 1.000.000)`}
          </Formula>
          <p className="mt-3">
            Normalisasi per juta penduduk mencegah Jawa otomatis “tinggi”
            hanya karena jumlah kampus. Tab <em>Pendidikan</em> mewarnai
            provinsi menurut IDPKI (krem → teal).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">6. Risiko</h2>
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
          <h2 className="font-display text-2xl">7. Tertil dan matriks 3×3</h2>
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
          <h2 className="font-display text-2xl">8. Indeks senjang (prioritas)</h2>
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
              Kurasi awal: 13 PWK, 10 geologi, 8 arsitektur, 8 lingkungan, 8
              kelautan — bukan direktori BAN-PT lengkap; dapat dimatikan di
              panel.
            </li>
            <li>
              13 pusat studi kebencanaan (antara lain TDMRC USK, PSB Unand, PSBA
              UGM, RCDM ITB, PUI Gambut Unri, Nalodo Untad).
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
