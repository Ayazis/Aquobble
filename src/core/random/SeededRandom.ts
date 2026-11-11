import { hashString } from './hashString';
import type { Random } from './Random';

/** Deterministic PRNG (mulberry32). Same seed, same sequence. */
export class SeededRandom implements Random {
  private state: number;
  private readonly seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
    this.state = this.seed;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  fork(name: string): Random {
    // Multiply after the xor so fork("a").fork("b") differs from fork("b").fork("a").
    const mixed = Math.imul(this.seed ^ hashString(name), 0x9e3779b1) ^ 0x5bd1e995;
    return new SeededRandom(mixed >>> 0);
  }
}
