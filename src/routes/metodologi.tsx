import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/metodologi")({ component: Metodologi });

function Metodologi() {
  return (
    <main className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-surface px-4 py-4">
        <Link to="/" className="text-sm text-muted hover:text-ink">
          ← Peta
        </Link>
        <h1 className="mt-2 font-display text-3xl">Metodologi PKPRB</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Peta ini menunjukkan keselarasan antara profil risiko bencana dan
          dukungan pendidikan tinggi (prodi, pusat studi, PkM) bagi ketangguhan
          infrastruktur. Bukan peta kesiapan atau ketangguhan daerah.
        </p>
      </header>
      <article className="mx-auto max-w-2xl space-y-8 px-4 py-10 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-display text-2xl">Tiga lapisan</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              <strong>Risiko</strong> — IRBI / profil bahaya (PuSGeN). Komposit
              dikalibrasi ke angka publik IRBI 2024 (Maluku 161,5; DKI 59,29;
              Malut 145,09). Skor per bahaya pada prototipe ini bersifat relatif.
            </li>
            <li>
              <strong>IDPKI</strong> — Indeks Dukungan Pendidikan untuk
              Ketangguhan Infrastruktur, dihitung per juta penduduk.
            </li>
            <li>
              <strong>Keselarasan 3×3</strong> — tertil risiko × tertil IDPKI.
              Kuadran intervensi: senjang (risiko tinggi, IDPKI rendah).
            </li>
          </ol>
        </section>
        <section>
          <h2 className="font-display text-2xl">Rumus IDPKI</h2>
          <p className="mt-3">
            Setiap prodi menyumbang{" "}
            <em>bobot bahaya × strata × mutu akreditasi × (1 + IABEE)</em>.
            Strata: S3 1,00 · S2 0,75 · S1 0,50 · D4 0,40. Mutu: Unggul 1,00 ·
            Baik Sekali 0,80 · Baik 0,60 · Terakreditasi 0,40. IABEE General
            +0,25; Provisional +0,10 — hanya prodi teknik.
          </p>
          <p className="mt-3">
            Pusat studi ditambahkan terpisah, dengan kematangan (anchor / PUI)
            dan kesesuaian bahaya. Spillover: kampus nasional/IABEE dan pusat
            studi nasional menyumbang ke provinsi sepulau.
          </p>
          <p className="mt-3">
            IDPKI = kapasitas / (penduduk / 1.000.000). Normalisasi per kapita
            mencegah Jawa otomatis “tinggi” hanya karena jumlah kampus.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Sumber data prototipe</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>90 prodi S1 Teknik Sipil BAN-PT / LAM Teknik (lokasi + peringkat).</li>
            <li>14 prodi kebencanaan BAN-PT.</li>
            <li>
              Kurasi awal PWK, geologi, arsitektur, lingkungan, kelautan — bukan
              direktori BAN-PT lengkap; dapat dimatikan di panel.
            </li>
            <li>13 pusat studi kebencanaan (TDMRC, PSB Unand, PSBA UGM, RCDM ITB, dll.).</li>
            <li>Batas 38 provinsi (peta administratif).</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl">Yang tidak diklaim</h2>
          <p className="mt-3">
            PKPRB tidak mengukur kesiapsiagaan BPBD, kepatuhan SNI, atau mutu
            lulusan di lapangan. Bobot prodi × bahaya adalah prior Delphi —
            geser sliders untuk uji sensitivitas.
          </p>
        </section>
      </article>
    </main>
  );
}
