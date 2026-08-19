# PKPRB

**Peta Keselarasan Pendidikan dan Risiko Bencana**

Atlas interaktif 38 provinsi Indonesia yang menampilkan kaitan antara profil risiko bencana (IRBI / bahaya) dan dukungan pendidikan tinggi yang relevan bagi ketangguhan infrastruktur.

Bukan peta kesiapan, ketangguhan, atau kapasitas kelembagaan daerah.

## Tiga lapisan peta

1. **Risiko** — komposit IRBI-gaya dan profil per bahaya (gempabumi, tsunami, banjir, longsor, likuefaksi, gunung api, karhutla).
2. **IDPKI** — Indeks Dukungan Pendidikan untuk Ketangguhan Infrastruktur, dihitung **per juta penduduk**.
3. **Keselarasan 3×3** — tertil risiko × tertil IDPKI. Kuadran intervensi: kesenjangan kapasitas pendidikan.

Bobot prodi (sipil, kebencanaan, PWK, geologi, arsitektur, lingkungan, kelautan), bonus IABEE, pusat studi/PkM, dan spillover antarprovinsi dapat digeser di panel kiri.

## Disclaimer

Skor risiko pada prototipe ini dikalibrasi ke angka publik IRBI 2024 (contoh: Maluku 161,5; DKI Jakarta 59,29), tetapi **bukan salinan resmi IRBI BNPB per sel**. Inventaris prodi bersifat kurasi (BAN-PT / pangkalan data P2MI) dan perlu validasi berkala. Hubungan disiplin–bahaya adalah matriks kerja, bukan hasil regresi.

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
