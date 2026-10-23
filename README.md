# PKPRB

**Peta Keselarasan Pendidikan dan Risiko Bencana**

Atlas interaktif 38 provinsi Indonesia yang menampilkan kaitan antara profil risiko bencana (IRBI / bahaya) dan dukungan pendidikan tinggi yang relevan bagi ketangguhan infrastruktur.

Bukan peta kesiapan, ketangguhan, atau kapasitas kelembagaan daerah.

## Tiga lapisan peta

1. **Risiko** — komposit IRBI 2025 resmi tingkat provinsi, plus rata-rata skor kabupaten untuk lima bahaya filter (gempabumi, tsunami, banjir, longsor, likuefaksi). Gunung api dan karhutla tetap ada di data IRBI dan di jawaban kuesioner, tetapi tidak masuk filter peta.
2. **IDPKI** — Indeks Dukungan Pendidikan untuk Ketangguhan Infrastruktur; warna peta memakai `ln(1 + kapasitas)`. Angka per juta penduduk tetap di panel detail.
3. **Keselarasan 3×3** — tertil risiko × tertil IDPKI. Kuadran intervensi: kesenjangan kapasitas pendidikan.

Bobot prodi (sipil, kebencanaan, PWK, geologi, arsitektur, lingkungan, kelautan), bonus IABEE, pusat studi/PkM, dan spillover antarprovinsi dapat digeser di panel kiri.

Dua versi bobot disiplin × bahaya dapat dipilih di peta. V0 Bawaan adalah prior di `src/lib/weights.ts`. V1 Tervalidasi dibekukan 23 Oktober 2026 pukul 17.02 WIB dari 24 validator (`src/data/v1-beku-20261023.json`): hanya sel yang selisih mediannya mencapai 0,125 diganti median. Provinsi yang label Keselarasannya berbeda antara V0 dan V1 pada filter yang aktif ditandai sensitif.

## Validasi ahli

Formulir penilaian bobot: [`/kuesioner.html`](./public/kuesioner.html) (tautan **Validasi** di header peta dan halaman Metodologi). Versi beku untuk workshop KoNTekS 20 / 24 Oktober 2026:

- **Validator** menekan **Kirim isian** (tersimpan di server setelah commit). Peserta tidak mengunduh berkas.
- **Fasilitator** mengunduh JSON atau CSV di [`/validasi/hasil`](./src/routes/validasi.hasil.tsx). Tanpa env, server memakai token yang sama dengan panduan fasilitator. Env `VALIDASI_TOKEN` atau `VALIDASI_EXPORT_TOKEN` menimpa nilai itu bila diisi. Nilai token tidak dicetak di halaman atau log.
- `GET /api/validasi/health` memeriksa koneksi basis data tanpa mengembalikan jawaban.
- Jawaban sebelum 23 Oktober 2026 pukul 00:00 WIB bertanda `fase = pilot` dan tidak masuk agregasi. Baris itu tetap ada dan ikut unduhan ber-token, dengan kolom `fase`. Kiriman baru bertanda `validasi`. Migrasi `0004_validasi_fase.sql` menulis tanda itu. Build preview tidak menjalankan migrasi karena memakai database yang sama dengan produksi; tanda tersimpan saat deploy production.

**Database wajib untuk workshop:** set `DATABASE_URL` (Neon/Postgres). Tanpa itu preview memakai PGLite di memori dan jawaban hilang saat server restart.

## Disclaimer

Komposit memakai indeks resmi IRBI 2025 tingkat provinsi (contoh tampilan: Papua Barat Daya 230,78; Maluku 203,94; DKI Jakarta 57,58; cap 250). Skor per bahaya adalah rata-rata kabupaten dari tabel ancaman IRBI yang sama (cap 40) — **bukan** angka resmi provinsi BNPB per sel. Inventaris prodi bersifat kurasi (BAN-PT / pangkalan data P2MI) dan perlu validasi berkala. Hubungan disiplin–bahaya adalah matriks kerja, bukan hasil regresi.

Proyek terkait P2MI Multidisiplin FTSL ITB 2026 _Mainstreaming Disaster Resiliency in Infrastructure Systems_.

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
