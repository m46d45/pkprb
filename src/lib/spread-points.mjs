/**
 * Geser titik yang terlalu dekat supaya masing-masing bisa diklik.
 * minDistance dalam satuan koordinat yang sama dengan x,y.
 */
export function spreadPositions(points, minDistance) {
  const placed = points.map((point) => ({ ...point }));
  const min = Math.max(0, minDistance);
  if (placed.length < 2 || min === 0) return placed;

  for (let iter = 0; iter < 48; iter += 1) {
    let moved = false;
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i];
        const b = placed[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist >= min) continue;
        if (dist < 1e-6) {
          const ang = ((i + 1) * 2.399 + j * 0.7) % (Math.PI * 2);
          dx = Math.cos(ang);
          dy = Math.sin(ang);
          dist = 1;
        }
        const push = (min - dist) / 2;
        const ux = (dx / dist) * push;
        const uy = (dy / dist) * push;
        a.x -= ux;
        a.y -= uy;
        b.x += ux;
        b.y += uy;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return placed;
}
