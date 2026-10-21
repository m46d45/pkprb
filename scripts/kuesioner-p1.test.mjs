import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../public/kuesioner.html", import.meta.url), "utf8");

const DEF = `const DEF = {
      "Gempabumi":[1,.55,.4,.9,.25,.25,.85,.7],
      "Tsunami":[.7,.35,.8,.65,.4,.9,.9,.75],
      "Banjir":[.85,.3,.85,.35,.75,.35,.85,.8],
      "Longsor":[.9,.25,.55,.95,.4,.15,.8,.7],
      "Likuefaksi":[1,.25,.35,.9,.2,.15,.7,.55],
      "Gunung api":[.55,.3,.5,.95,.4,.1,.85,.7],
      "Karhutla":[.25,.15,.45,.25,.7,.05,.8,.75],
      "Komposit":[.85,.4,.55,.7,.45,.4,.85,.8]
    };`;

test("nilai bawaan matriks tidak berubah", () => {
  assert.ok(html.includes(DEF));
});

test("teks P1 untuk peserta", () => {
  assert.match(html, /Perkiraan <strong>10–15 menit<\/strong>/);
  assert.doesNotMatch(html, /20–25 menit/);
  assert.match(html, /<strong>Nilai bawaan<\/strong> = faktor pengali \(0–1\)/);
  assert.match(html, /tidak ada baris data kabupaten di tabel IRBI/);
  assert.match(html, /value="data_na"/);
  assert.match(html, /value="irbi_prov"/);
  assert.match(html, /value="tetap0"/);
  assert.match(html, /value="mean"/);
  assert.match(html, /<h2>3\. Faktor pengali jenjang<\/h2>/);
  assert.match(html, /meningkat secara proporsional dalam aspek ketangguhan bencana/);
  assert.match(html, /<h2>4\. Faktor pengali akreditasi<\/h2>/);
  assert.match(html, /placeholder="1,00"/);
  assert.match(html, /placeholder="0,70"/);
  assert.doesNotMatch(html, /IABEE \(1,00\)/);
  assert.doesNotMatch(html, /Unggul \/ A \(0,90\)/);
  assert.match(html, /C1\. Akreditasi IABEE \(General Accreditation\/GA\) disetarakan dengan Internasional/);
  assert.match(
    html,
    /Hanya IABEE General Accreditation \(GA\) yang dihitung sebagai akreditasi internasional\. IABEE Provisional Accreditation \(PA\) bukan akreditasi/,
  );
  assert.doesNotMatch(html, /General\/Provisional/);
  assert.doesNotMatch(html, /keduanya diberi faktor/);
  assert.match(html, /<strong>PkM<\/strong> = pengabdian kepada masyarakat/);
  assert.match(html, /<strong>Pancaran \(spillover\)<\/strong>/);
  assert.match(html, /value="arsitektur"/);
  assert.match(html, /value="kelautan"/);
  assert.match(html, /value="multidisiplin"/);
  assert.match(html, /Kebencanaan \/ IRBI/);
  assert.match(html, /8\. Catatan terbuka tentang peta\/model PKPRB/);
  assert.match(html, /Satu hal pada peta\/model PKPRB yang sebaiknya diubah/);
  assert.match(html, /Satu hal pada peta\/model PKPRB yang sebaiknya tidak diubah/);
  assert.match(html, /Catatan lain tentang peta\/model PKPRB/);
  assert.match(html, /Jawaban langsung tersimpan di server\. Bapak\/Ibu tidak perlu mengunduh apa pun\./);
  const visible = html.replace(/<script[\s\S]*<\/script>/g, "").replace(/<style[\s\S]*<\/style>/g, "");
  assert.doesNotMatch(visible, /JSON/i);
  assert.match(html, /1<\/strong> = disiplin inti/);
  assert.match(html, /Cukup isi baris bahaya yang sesuai keahlian/);
  assert.match(html, /F1 menanyakan kesan umum atas nilai bawaan/);
  assert.match(html, /pkprb-kuesioner-v2/);
  assert.match(html, /pkprb-kuesioner-v1/);
  assert.match(html, /pkprb-terkirim/);
  assert.match(html, /schema: 2/);
  assert.match(html, /2026-10-23-konteks20/);
  assert.match(html, /form_rev: "2026-10-22"/);
  assert.match(html, /Isi lagi sebagai orang lain/);
  assert.match(html, /Koneksi lambat — draf aman, tekan Kirim lagi/);
  assert.match(html, /<details class=\\"bahaya\\"/);
});

test("urutan keahlian mengikuti disiplin, lalu pendidikan dan bpbd", () => {
  const block = html.slice(html.indexOf('name="ahli"'), html.indexOf("Pernah membuka peta"));
  const values = [...block.matchAll(/value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(values, [
    "sipil",
    "arsitektur",
    "pwk",
    "geologi",
    "lingkungan",
    "kelautan",
    "kebencanaan",
    "multidisiplin",
    "pendidikan",
    "bpbd",
  ]);
});
