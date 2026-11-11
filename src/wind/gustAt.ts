import type { GustFronts } from './GustFronts';
import type { WindDirection } from './WindDirection';

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Gust fronts as bands moving downwind: a quick rise and a long fall-off, wobbled across the wind.
 * Exact TS twin of `windGust()` in `windShaderChunk`; keep both in step.
 */
export function gustAt(
  x: number,
  z: number,
  t: number,
  dir: WindDirection,
  strength: number,
  fronts: GustFronts,
): number {
  const along = x * dir.x + z * dir.z;
  const across = -x * dir.z + z * dir.x;
  const wobble = 0.35 * Math.sin(across * 0.05 + fronts.phase) + 0.15 * Math.sin(across * 0.13 + t * 0.2);
  const p = (along - t * fronts.speed) / fronts.spacing + wobble;
  const f = p - Math.floor(p);
  const front = smoothstep(0, 0.12, f) * (1 - smoothstep(0.12, 0.6, f));
  return front * strength;
}
