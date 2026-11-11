import type { Vec3 } from '@core';
import type { GerstnerWave } from './GerstnerWave';
import type { WaveField } from './WaveField';
import type { WaveScale } from './waveShoaling';

const GRAVITY = 9.81;
/** Fixed-point steps to find the rest point whose displaced position lands on the queried (x, z). */
const INVERT_STEPS = 4;
const UNCHANGED: WaveScale = { kScale: 1, ampScale: 1 };

/** Per-wave numbers, also uploaded to the water shader (`gerstnerUniforms`). */
export interface GerstnerTerm {
  dirX: number;
  dirZ: number;
  k: number;
  amplitude: number;
  /** Angular frequency sqrt(g k): kept when shoaling shortens the wave, so the pattern never drifts apart. */
  omega: number;
  phase: number;
  /** Steepness / wave count (Q k A), so the summed crests never loop. */
  pull: number;
}

/**
 * Sum of Gerstner waves (GPU Gems 1, ch. 1). Points move in circles: horizontally towards crests,
 * which sharpens them. Heights are exact at the queried point (the horizontal shift is inverted).
 * `shoal` (optional) shortens and raises the waves where the water is shallow, exactly like the shader.
 */
export class GerstnerWaveField implements WaveField {
  readonly terms: readonly GerstnerTerm[];

  constructor(
    waves: readonly GerstnerWave[],
    private readonly shoal: (x: number, z: number) => WaveScale = () => UNCHANGED,
  ) {
    const n = Math.max(1, waves.length);
    this.terms = waves.map((w) => {
      const k = (2 * Math.PI) / w.wavelength;
      const { dirX, dirZ, amplitude, phase } = w;
      return { dirX, dirZ, k, amplitude, phase, omega: Math.sqrt(GRAVITY * k), pull: w.steepness / n };
    });
  }

  waveHeightAt(x: number, z: number, t: number): number {
    const s = this.shoal(x, z);
    if (s.ampScale <= 0) return 0;
    const [rx, rz] = this.restPoint(x, z, t, s);
    let y = 0;
    for (const w of this.terms) y += w.amplitude * s.ampScale * Math.sin(theta(w, s, rx, rz, t));
    return y;
  }

  waveNormalAt(x: number, z: number, t: number): Vec3 {
    const s = this.shoal(x, z);
    if (s.ampScale <= 0) return { x: 0, y: 1, z: 0 };
    const [rx, rz] = this.restPoint(x, z, t, s);
    let nx = 0;
    let ny = 1;
    let nz = 0;
    for (const w of this.terms) {
      const th = theta(w, s, rx, rz, t);
      const k = w.k * s.kScale;
      const ka = k * w.amplitude * s.ampScale;
      nx -= w.dirX * ka * Math.cos(th);
      nz -= w.dirZ * ka * Math.cos(th);
      ny -= reach(w, s) * k * Math.sin(th);
    }
    const len = Math.hypot(nx, ny, nz);
    return { x: nx / len, y: ny / len, z: nz / len };
  }

  private restPoint(x: number, z: number, t: number, s: WaveScale): [number, number] {
    let rx = x;
    let rz = z;
    for (let i = 0; i < INVERT_STEPS; i++) {
      let dx = 0;
      let dz = 0;
      for (const w of this.terms) {
        const c = reach(w, s) * Math.cos(theta(w, s, rx, rz, t));
        dx += w.dirX * c;
        dz += w.dirZ * c;
      }
      rx = x - dx;
      rz = z - dz;
    }
    return [rx, rz];
  }
}

function theta(w: GerstnerTerm, s: WaveScale, x: number, z: number, t: number): number {
  return w.k * s.kScale * (w.dirX * x + w.dirZ * z) - w.omega * t + w.phase;
}

/** Horizontal swing Q A = pull / k, faded with the amplitude near the shore. Mirrors the shader. */
function reach(w: GerstnerTerm, s: WaveScale): number {
  return (w.pull / (w.k * s.kScale)) * Math.min(1, s.ampScale);
}
