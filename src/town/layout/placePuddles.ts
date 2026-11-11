import type { Random } from '@core';
import { overlaps, plotBounds, roadBounds } from './Bounds';
import type { Puddle } from './Puddle';
import type { TownLayout } from './TownLayout';

/** Puddles per road at most, and on the square. */
const PER_ROAD = 2;
const ON_SQUARE = 2;
/** Puddles keep off this share of a road's length at each end (under the square, in the gate). */
const ROAD_END = 0.18;
/** Metres either side of the centreline a puddle's middle may lie: the solid middle of the road, ruts included. */
const ACROSS = 0.6;
/** Ellipse radii (m): long along the road, short across it. */
const LONG = [0.8, 1.5] as const;
const SHORT = [0.55, 0.8] as const;
/** Clearance (m) from any prop or building, so a puddle never runs under a well or a cart. */
const CLEAR = 0.6;
const TRIES = 12;

/** A few puddles on the dirt roads (often in a rut) and the square, placed with the seeded `random`. */
export function placePuddles(layout: TownLayout, random: Random): Puddle[] {
  const puddles: Puddle[] = [];
  const blocked = [...layout.buildings, ...layout.props].map(plotBounds);
  const free = (p: Puddle) =>
    !blocked.some((b) =>
      overlaps(b, {
        minX: p.x - p.alongX - CLEAR,
        maxX: p.x + p.alongX + CLEAR,
        minZ: p.z - p.alongZ - CLEAR,
        maxZ: p.z + p.alongZ + CLEAR,
      }),
    ) && puddles.every((q) => Math.hypot(q.x - p.x, q.z - p.z) > q.alongX + q.alongZ + p.alongX + p.alongZ);
  const tryAdd = (make: () => Puddle) => {
    for (let i = 0; i < TRIES; i++) {
      const p = make();
      if (free(p)) return void puddles.push(p);
    }
  };

  for (const road of layout.roads) {
    const b = roadBounds(road);
    const alongX = road.from.z === road.to.z;
    const count = Math.floor(random.next() * (PER_ROAD + 1));
    for (let n = 0; n < count; n++) {
      tryAdd(() => {
        const t = random.range(ROAD_END, 1 - ROAD_END);
        const across = random.range(-ACROSS, ACROSS);
        const long = random.range(...LONG);
        const short = random.range(...SHORT);
        return alongX
          ? { x: b.minX + (b.maxX - b.minX) * t, z: (b.minZ + b.maxZ) / 2 + across, alongX: long, alongZ: short }
          : { x: (b.minX + b.maxX) / 2 + across, z: b.minZ + (b.maxZ - b.minZ) * t, alongX: short, alongZ: long };
      });
    }
  }
  const inner = layout.plazaHalfSize - 1.8;
  for (let n = 0; n < ON_SQUARE; n++) {
    tryAdd(() => {
      const r = random.range(0.6, 1.2);
      return {
        x: random.range(-inner, inner),
        z: random.range(-inner, inner),
        alongX: r,
        alongZ: r * random.range(0.6, 1),
      };
    });
  }
  return puddles;
}
