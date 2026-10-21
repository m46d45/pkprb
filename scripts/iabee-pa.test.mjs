import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const scoring = readFileSync(new URL("../src/lib/scoring.ts", import.meta.url), "utf8");
const start = scoring.indexOf("export function prodiAccLevel");
const end = scoring.indexOf("\nfunction strataKey");
const fnSrc = scoring
  .slice(start, end)
  .replace("export function prodiAccLevel(p: Program): AccLevel", "function prodiAccLevel(p)");
const prodiAccLevel = new Function(`${fnSrc}\nreturn prodiAccLevel;`)();

test("hanya IABEE GA yang mendapat faktor internasional", () => {
  assert.equal(prodiAccLevel({ iabee: "general", accreditation: "Unggul" }), "internasional");
  assert.equal(prodiAccLevel({ iabee: "provisional", accreditation: "Unggul" }), "unggul");
  assert.equal(prodiAccLevel({ iabee: "provisional", accreditation: "Baik Sekali" }), "baik-sekali");
  assert.equal(prodiAccLevel({ iabee: "provisional", accreditation: "Internasional" }), "baik");
  assert.equal(prodiAccLevel({ iabee: "none", accreditation: "Unggul" }), "unggul");
});

test("Teknik Sipil Unand berstatus PA memakai peringkat LAM", () => {
  const programs = readFileSync(new URL("../src/data/programs.ts", import.meta.url), "utf8");
  const row = programs.split("\n").find((line) => line.includes('"id": "p17"'));
  assert.ok(row);
  assert.match(row, /"accreditation": "Unggul"/);
  assert.match(row, /"iabee": "provisional"/);
});
