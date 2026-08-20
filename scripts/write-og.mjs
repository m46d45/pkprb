/** Assemble public/og.jpg from base64 chunks. Correct PKPRB + full Indonesia map. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const dir = dirname(fileURLToPath(import.meta.url));
const parts = [0, 1].map((i) => readFileSync(join(dir, `og-chunk-${i}.txt`), "utf8").trim());
const out = join(dir, "..", "public", "og.jpg");
writeFileSync(out, Buffer.from(parts.join(""), "base64"));
console.log("wrote", out, "bytes", Buffer.from(parts.join(""), "base64").length);
