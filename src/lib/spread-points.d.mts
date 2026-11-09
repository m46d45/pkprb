export function spreadPositions<T extends { x: number; y: number }>(
  points: T[],
  minDistance: number,
): T[];
