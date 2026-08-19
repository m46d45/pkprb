import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("..", import.meta.url)));
const src = join(root, "node_modules/@electric-sql/pglite/dist");
const dest = join(root, ".vercel/output/functions/__server.func/_libs");
mkdirSync(dest, { recursive: true });
for (const file of ["pglite.data", "pglite.wasm"]) {
  const from = join(src, file);
  if (existsSync(from)) copyFileSync(from, join(dest, file));
}
