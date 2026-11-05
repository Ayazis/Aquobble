import type { Random } from '@core';
import type { Noise2D } from './Noise2D';

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Seeded value noise on an integer lattice, smoothly interpolated. */
export class ValueNoise implements Noise2D {
  private readonly perm = new Uint8Array(512);
  private readonly values = new Float32Array(256);

  constructor(random: Random) {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random.next() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    for (let i = 0; i < 256; i++) this.values[i] = random.next() * 2 - 1;
  }

  sample(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = fade(x - xi);
    const w = fade(y - yi);
    const top = this.lerp(this.at(xi, yi), this.at(xi + 1, yi), u);
    const bottom = this.lerp(this.at(xi, yi + 1), this.at(xi + 1, yi + 1), u);
    return this.lerp(top, bottom, w);
  }

  private at(x: number, y: number): number {
    return this.values[this.perm[(x & 255) + this.perm[y & 255]]];
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}
