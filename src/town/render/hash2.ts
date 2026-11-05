/** Cheap deterministic hash of a 2D integer-ish point and a seed, in [0, 1). */
export function hash2(x: number, z: number, seed = 0): number {
  const s = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}
