-- Idempotensi kiriman baru. Tidak mengubah payload baris yang sudah ada:
-- kolom baru nullable, indeks hanya untuk client_id terisi.

alter table validasi_jawaban
  add column if not exists client_id text;

create unique index if not exists validasi_jawaban_client_id_uidx
  on validasi_jawaban (client_id);
