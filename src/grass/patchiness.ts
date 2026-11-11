/**
 * How thickly grass grows at (x, z), in [0, 1]: broad clumps and thin patches some 10 to 25 m across, from a
 * few crossed sine waves (fixed phases, so the same island always gets the same patches).
 */
export function patchiness(x: number, z: number): number {
  const a = Math.sin(x * 0.21 + z * 0.13 + 1.7) + Math.sin(-x * 0.11 + z * 0.26 + 0.4);
  const b = Math.sin(x * 0.47 - z * 0.39 + 2.9) * 0.5;
  const v = (a + b + 2.5) / 5;
  const t = Math.min(Math.max((v - 0.2) / 0.6, 0), 1);
  return t * t * (3 - 2 * t);
}
