-- Jawaban formulir validasi bobot (workshop KoNTekS).
-- Submit publik (POST); unduh hanya dengan token fasilitator (GET).

create table if not exists validasi_jawaban (
  id text primary key,
  created_at timestamptz not null default now(),
  versi text,
  nama text,
  institusi text,
  payload jsonb not null
);

create index if not exists validasi_jawaban_created_at_idx
  on validasi_jawaban (created_at desc);
