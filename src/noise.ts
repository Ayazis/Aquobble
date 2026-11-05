/** Small seeded 2D value noise (smooth, range roughly -1..1). */
export function createNoise2D(seed: number): (x: number, y: number) => number {
  const perm = new Uint8Array(512);
  let s = seed >>> 0;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const vals = Float32Array.from({ length: 256 }, () => rand() * 2 - 1);

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const v = (x: number, y: number) => vals[perm[(x & 255) + perm[y & 255]]];

  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = fade(xf), w = fade(yf);
    const top = v(xi, yi) + (v(xi + 1, yi) - v(xi, yi)) * u;
    const bot = v(xi, yi + 1) + (v(xi + 1, yi + 1) - v(xi, yi + 1)) * u;
    return top + (bot - top) * w;
  };
}
