# PKPRB

**Peta Keselarasan Pendidikan dan Risiko Bencana**

Atlas interaktif 38 provinsi Indonesia yang menampilkan kaitan antara profil risiko bencana (IRBI / bahaya) dan dukungan pendidikan tinggi yang relevan bagi ketangguhan infrastruktur.

Bukan peta kesiapan, ketangguhan, atau kapasitas kelembagaan daerah.

## Tiga lapisan peta

1. **Risiko** — komposit IRBI 2025 resmi tingkat provinsi, plus rata-rata skor kabupaten per bahaya (gempabumi, tsunami, banjir, longsor, likuefaksi, gunung api, karhutla).
2. **IDPKI** — Indeks Dukungan Pendidikan untuk Ketangguhan Infrastruktur; warna peta memakai `ln(1 + kapasitas)`. Angka per juta penduduk tetap di panel detail.
3. **Keselarasan 3×3** — tertil risiko × tertil IDPKI. Kuadran intervensi: kesenjangan kapasitas pendidikan.

Bobot prodi (sipil, kebencanaan, PWK, geologi, arsitektur, lingkungan, kelautan), bonus IABEE, pusat studi/PkM, dan spillover antarprovinsi dapat digeser di panel kiri.

## Validasi ahli

Formulir penilaian bobot: [`/kuesioner.html`](./public/kuesioner.html) (tautan **Validasi** di header peta dan halaman Metodologi). Versi beku untuk workshop KoNTekS 20 / 24 Oktober 2026: jawaban diunduh sebagai JSON dan diserahkan ke fasilitator — tidak otomatis masuk ke GitHub.

## Disclaimer

Komposit memakai indeks resmi IRBI 2025 tingkat provinsi (contoh tampilan: Papua Barat Daya 230,78; Maluku 203,94; DKI Jakarta 57,58; cap 250). Skor per bahaya adalah rata-rata kabupaten dari tabel ancaman IRBI yang sama (cap 40) — **bukan** angka resmi provinsi BNPB per sel. Inventaris prodi bersifat kurasi (BAN-PT / pangkalan data P2MI) dan perlu validasi berkala. Hubungan disiplin–bahaya adalah matriks kerja, bukan hasil regresi.

Proyek terkait P2MI Multidisiplin FTSL ITB 2026 *Mainstreaming Disaster Resiliency in Infrastructure Systems*.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:8080`.

## Tumpukan

TanStack Start · Vite · React 19 · d3-geo · Tailwind v4 · Zustand

## Lisensi data

Batas administrasi dari GeoJSON provinsi Indonesia. Data pendidikan dan indeks di repositori ini untuk keperluan penelitian dan diskusi; bukan produk resmi BNPB, BAN-PT, atau perguruan tinggi yang tercantum.
