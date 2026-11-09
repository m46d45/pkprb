import assert from "node:assert/strict";
import test from "node:test";
import { spreadPositions } from "../src/lib/spread-points.mjs";

test("titik yang menumpuk di satu kota saling menjauh", () => {
  const stacked = [
    "Institut Teknologi Bandung",
    "Universitas Pendidikan Indonesia",
    "Universitas Kristen Maranatha",
    "Universitas Katolik Parahyangan",
    "Institut Teknologi Nasional Bandung",
  ].map((id) => ({ id, x: 400, y: 220 }));
  const spread = spreadPositions(stacked, 26);
  for (let i = 0; i < spread.length; i += 1) {
    for (let j = i + 1; j < spread.length; j += 1) {
      const dist = Math.hypot(spread[i].x - spread[j].x, spread[i].y - spread[j].y);
      assert.ok(dist >= 25.5, `${spread[i].id} menempel ${spread[j].id} (${dist})`);
    }
  }
  assert.ok(spread.some((point) => point.id === "Institut Teknologi Bandung"));
  for (const point of spread) {
    const shift = Math.hypot(point.x - 400, point.y - 220);
    assert.ok(shift < 90, `${point.id} terlempar ${shift.toFixed(1)}`);
  }
});

test("titik yang sudah renggang tidak digeser", () => {
  const apart = spreadPositions(
    [
      { id: "a", x: 0, y: 0 },
      { id: "b", x: 40, y: 0 },
    ],
    26,
  );
  assert.equal(apart[0].x, 0);
  assert.equal(apart[1].x, 40);
});
