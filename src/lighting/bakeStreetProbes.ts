import type { Vec3 } from '@core';
import type { StreetLamp } from './StreetLamp';

/** Distance to the first hit along a unit ray, or null when nothing is within `max`. */
export type RayCast = (origin: Vec3, direction: Vec3, max: number) => number | null;

/** A probe baked in a street: position, reach and L1 SH of how open the sky is around it. */
export interface StreetProbe {
  position: Vec3;
  radius: number;
  sh: [number, number, number, number];
}

const RAYS = 48;
const REACH = 20;
/** Probes sit this high over a lamp's ground point: above the lamp head's post, at eye-to-eaves height. */
const LIFT = 2.5;
const RADIUS = 9;

/**
 * Bakes a light probe at each street lamp (lamps stand in the streets, at the square and in the gates) and
 * keeps the `max` most enclosed ones: alleys and gate tunnels, where the sky fill should be darker. Each
 * probe projects sky visibility onto L1 spherical harmonics; downward rays count as open, so a probe on an
 * open meadow bakes to exactly (1, 0, 0, 0) and changes nothing.
 */
export function bakeStreetProbes(lamps: readonly StreetLamp[], castRay: RayCast, max: number): StreetProbe[] {
  const directions = sphere(RAYS);
  return lamps
    .map((lamp) => {
      const position = { x: lamp.ground.x, y: lamp.ground.y + LIFT, z: lamp.ground.z };
      return { position, radius: RADIUS, sh: bakeSh(position, directions, castRay) };
    })
    .sort((a, b) => a.sh[0] - b.sh[0])
    .slice(0, max)
    .filter((probe) => probe.sh[0] < 0.98);
}

/** L1 SH projection of visibility (1 open, 0 blocked) over evenly spread directions. */
export function bakeSh(origin: Vec3, directions: readonly Vec3[], castRay: RayCast): [number, number, number, number] {
  const sh: [number, number, number, number] = [0, 0, 0, 0];
  for (const d of directions) {
    const open = d.y < -0.1 || castRay(origin, d, REACH) === null ? 1 : 0;
    sh[0] += open;
    sh[1] += 3 * open * d.x;
    sh[2] += 3 * open * d.y;
    sh[3] += 3 * open * d.z;
  }
  return sh.map((c) => c / directions.length) as [number, number, number, number];
}

/** Fibonacci sphere: `n` nearly even unit directions. */
export function sphere(n: number): Vec3[] {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963;
    return { x: r * Math.cos(phi), y, z: r * Math.sin(phi) };
  });
}
