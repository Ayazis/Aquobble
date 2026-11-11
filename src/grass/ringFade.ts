import type { GrassRing } from './GrassRing';

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Size factor (0 to 1) of a ring's tufts at a camera distance; the wind shader computes the same. */
export function ringFade(ring: GrassRing, distance: number): number {
  const [inStart, inEnd] = ring.fadeIn;
  const grown = inEnd > 0 ? smoothstep(inStart, inEnd, distance) : 1;
  return grown * (1 - smoothstep(ring.fadeOut[0], ring.fadeOut[1], distance));
}
