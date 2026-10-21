import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../public/validasi-hasil.html", import.meta.url), "utf8");

test("halaman proyeksi agregat tanpa sapaan dan tanpa slogan", () => {
  assert.match(html, /Agregasi validasi PKPRB/);
  assert.match(html, /Jumlah responden/);
  assert.match(html, /\/api\/validasi\?format=agregasi/);
  assert.match(html, /setInterval\(muat, 30000\)/);
  assert.match(html, /Usul naik/);
  assert.match(html, /Usul turun/);
  assert.match(html, /n_setuju/);
  assert.match(html, /n_tidak_yakin/);
  assert.match(html, /--paper: #f7f1e8/);
  assert.match(html, /--teal: #1b4f5c/);
  assert.doesNotMatch(html, /\bAnda\b/);
  assert.doesNotMatch(html, /simulasi/i);
  assert.doesNotMatch(html, /slogan/i);
});
