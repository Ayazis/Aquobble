import type { Random } from '@core';
import type { MoonPatch } from './MoonPatch';

/**
 * A few large soft "seas" in the upper left half, as on the real moon, and some small craters scattered
 * everywhere. Every patch lies inside the disc, so none spills over its edge.
 */
export function moonMaria(random: Random, seas = 5, craters = 9): MoonPatch[] {
  const patches: MoonPatch[] = [];
  for (let i = 0; i < seas + craters; i++) {
    const sea = i < seas;
    const radius = sea ? 0.18 + random.next() * 0.16 : 0.05 + random.next() * 0.06;
    const reach = 0.92 - radius;
    const angle = sea ? Math.PI * (0.35 + random.next() * 0.9) : random.next() * Math.PI * 2;
    const r = Math.sqrt(random.next()) * reach;
    patches.push({
      x: Math.cos(angle) * r,
      y: -Math.sin(angle) * r,
      radius,
      darkness: sea ? 0.22 + random.next() * 0.12 : 0.3,
    });
  }
  return patches;
}
