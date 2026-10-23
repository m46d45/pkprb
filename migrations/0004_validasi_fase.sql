-- Pisahkan uji coba dari validasi workshop KoNTekS 20.
-- Batas: 23 Oktober 2026 pukul 00:00 WIB (sama dengan BATAS_VALIDASI_SQL).
-- Baris yang sudah ada sebelum batas ditandai pilot dan tidak dihapus.
-- Baris baru memakai default validasi. Agregasi publik hanya membaca validasi.

alter table validasi_jawaban
  add column if not exists fase text;

update validasi_jawaban
set fase = case
  when created_at < timestamptz '2026-10-23 00:00:00+07' then 'pilot'
  else 'validasi'
end
where fase is null;

alter table validasi_jawaban
  alter column fase set default 'validasi';

alter table validasi_jawaban
  alter column fase set not null;

alter table validasi_jawaban
  drop constraint if exists validasi_jawaban_fase_check;

alter table validasi_jawaban
  add constraint validasi_jawaban_fase_check
  check (fase in ('pilot', 'validasi'));

create index if not exists validasi_jawaban_fase_created_at_idx
  on validasi_jawaban (fase, created_at);
