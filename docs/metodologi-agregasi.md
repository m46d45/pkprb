# Agregasi jawaban matriks validasi PKPRB

Dokumen ini menetapkan aturan agregasi butir A dan D. Aturan ini tidak mengubah peta. `DEFAULT_WEIGHTS`, bobot jenjang, bobot akreditasi, dan fungsi skor provinsi tetap seperti yang dipakai peta.

Agregasi dibaca di `GET /api/validasi?format=agregasi` tanpa token. Respons hanya berisi hitungan, bukan nama, institusi, atau catatan bebas.

## Sel matriks

Setiap sel disiplin × bahaya punya tiga keadaan yang tidak disamakan:

| Tampilan | Nilai di payload | Peran dalam agregasi |
|---|---|---|
| Belum diisi | kunci sel tidak ada | Bukan respons. Bukan setuju, bukan tidak yakin. |
| Setuju nilai bawaan | `setuju` | Respons. Masuk median sebagai angka nilai bawaan sel itu. |
| Tidak yakin | `tidak_yakin` | Respons. Dihitung, tetapi tidak masuk median. |
| 0; 0,25; 0,5; 0,75; 1 | angka | Respons. Masuk median sebagai angka itu. |

Nilai bawaan sel adalah angka pada `DEFAULT_WEIGHTS` untuk pasangan bahaya dan disiplin yang sama. Contoh: Gempabumi × Sipil = 1; Gempabumi × Arsitektur = 0,55. Angka ini tidak diubah oleh agregasi.

Untuk satu sel, dari seluruh jawaban:

- `n` = banyak respons eksplisit (angka + `setuju` + `tidak_yakin`).
- `n_setuju` = banyak nilai `setuju`.
- `n_tidak_yakin` = banyak nilai `tidak_yakin`.
- Median dihitung dari angka yang diusulkan ditambah nilai bawaan sekali untuk setiap `setuju`. `tidak_yakin` dan sel belum diisi tidak masuk himpunan median.
- Bila himpunan median kosong, `median` dan `status` kosong.

Median adalah median statistik. Jumlah ganjil: nilai tengah setelah diurut. Jumlah genap: rata-rata dua nilai tengah. Angka yang dipublikasikan dibulatkan ke 6 tempat desimal; pembulatan ini tidak mengubah ambang 0,125 pada data kuesioner.

## Status sel

Misalkan `m` median dan `b` nilai bawaan.

- `setuju` bila `|m − b| < 0,125`.
- `usul naik` bila `m − b ≥ 0,125`.
- `usul turun` bila `b − m ≥ 0,125`.

Ambang bersifat ketat. Selisih tepat 0,125 bukan `setuju`. Jawaban `setuju` memperkecil selisih karena masuk sebagai `b`. Jawaban `tidak_yakin` tidak menarik median ke mana pun.

Contoh. Bawaan 0,55. Empat respons: 0,75; 0,75; `setuju`; `tidak_yakin`. Himpunan median = {0,75; 0,75; 0,55}. Urut: 0,55; 0,75; 0,75. Median = 0,75. Selisih = 0,20. Status = `usul naik`. `n` = 4, `n_setuju` = 1, `n_tidak_yakin` = 1.

Contoh di dalam ambang. Bawaan 0,55. Respons: 0,5 dan `setuju`. Median dua nilai = (0,5 + 0,55) / 2 = 0,525. Selisih = 0,025. Status = `setuju`.

## Jenjang dan akreditasi

Kotak S1 / D4, S2, S3, Internasional / IABEE GA, Unggul / A, Baik Sekali / B, dan Baik / C tetap berupa angka bebas 0–1. Kosong pada formulir berarti setuju nilai bawaan. Karena itu, untuk faktor ini:

- angka 0–1 masuk median;
- kotak kosong atau kunci yang tidak ada dihitung `n_setuju` dan masuk median sebagai nilai bawaan faktor itu (jenjang 1; Internasional 1; Unggul 0,9; Baik Sekali 0,8; Baik 0,7);
- status memakai ambang yang sama dengan sel matriks.

Faktor ini tidak punya opsi `tidak_yakin`.

## Pilihan ganda

Butir pilihan (A1, A2, B1, C1, C2, D1, D2, E1, E2, F1, pernah membuka peta, keahlian, dan tiga centang persetujuan) dilaporkan sebagai tally: banyak jawaban, banyak yang kosong, dan hitungan tiap kode opsi. Keahlian dapat memuat lebih dari satu kode pada satu orang. Centang yang tersimpan sebagai `on` dihitung `dicentang`. Teks bebas tidak masuk agregasi.

## Baris yang sudah tersimpan

Baris lama yang sel matriksnya tidak ditulis tetap “belum diisi”. Agregasi tidak menafsirkan kekosongan lama sebagai `setuju` atau `tidak_yakin`, dan tidak menulis ulang baris tersebut.
