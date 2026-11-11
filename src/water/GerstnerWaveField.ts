import type { Vec3 } from '@core';
import type { GerstnerWave } from './GerstnerWave';
import type { WaveField } from './WaveField';

const GRAVITY = 9.81;
/** Fixed-point steps to find the rest point whose displaced position lands on the queried (x, z). */
const INVERT_STEPS = 4;

interface Term {
  w: GerstnerWave;
  k: number;
  speed: number;
  /** Horizontal pull factor Q / (k A N), so the summed crests never loop. */
  q: number;
}

/**
 * Sum of Gerstner waves (GPU Gems 1, ch. 1). Points move in circles: horizontally towards crests,
 * which sharpens them. Heights are exact at the queried point (the horizontal shift is inverted).
 */
export class GerstnerWaveField implements WaveField {
  private readonly terms: Term[];

  constructor(waves: readonly GerstnerWave[]) {
    const n = Math.max(1, waves.length);
    this.terms = waves.map((w) => {
      const k = (2 * Math.PI) / w.wavelength;
      return { w, k, speed: Math.sqrt(GRAVITY / k), q: w.amplitude > 0 ? w.steepness / (k * w.amplitude * n) : 0 };
    });
  }

  waveHeightAt(x: number, z: number, t: number): number {
    const [rx, rz] = this.restPoint(x, z, t);
    let y = 0;
    for (const { w, k, speed } of this.terms) y += w.amplitude * Math.sin(this.theta(w, k, speed, rx, rz, t));
    return y;
  }

  waveNormalAt(x: number, z: number, t: number): Vec3 {
    const [rx, rz] = this.restPoint(x, z, t);
    let nx = 0;
    let ny = 1;
    let nz = 0;
    for (const { w, k, speed, q } of this.terms) {
      const th = this.theta(w, k, speed, rx, rz, t);
      const ka = k * w.amplitude;
      nx -= w.dirX * ka * Math.cos(th);
      nz -= w.dirZ * ka * Math.cos(th);
      ny -= q * ka * Math.sin(th);
    }
    const len = Math.hypot(nx, ny, nz);
    return { x: nx / len, y: ny / len, z: nz / len };
  }

  private theta(w: GerstnerWave, k: number, speed: number, x: number, z: number, t: number): number {
    return k * (w.dirX * x + w.dirZ * z - speed * t) + w.phase;
  }

  private restPoint(x: number, z: number, t: number): [number, number] {
    let rx = x;
    let rz = z;
    for (let i = 0; i < INVERT_STEPS; i++) {
      let dx = 0;
      let dz = 0;
      for (const { w, k, speed, q } of this.terms) {
        const c = q * w.amplitude * Math.cos(this.theta(w, k, speed, rx, rz, t));
        dx += w.dirX * c;
        dz += w.dirZ * c;
      }
      rx = x - dx;
      rz = z - dz;
    }
    return [rx, rz];
  }
}
