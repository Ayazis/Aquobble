import type { Vec3 } from '@core';

/** Linear RGB triple. */
export type Rgb = [number, number, number];

/** Knobs of the analytic sky (the Preetham daylight model, as in three.js's `Sky`). */
export interface AtmosphereOptions {
  /** Haze: 2 is a clear day, 10 a milky one. */
  turbidity: number;
  /** Strength of the blue (molecular) scattering. */
  rayleigh: number;
  /** Strength of the haze (aerosol) scattering. */
  mieCoefficient: number;
  /** How tightly the haze glows round the sun (0..1). */
  mieG: number;
}

export const DEFAULT_ATMOSPHERE: AtmosphereOptions = {
  turbidity: 2.2,
  rayleigh: 1.35,
  mieCoefficient: 0.004,
  mieG: 0.8,
};

const TOTAL_RAYLEIGH: Rgb = [5.804542996261093e-6, 1.3562911419845635e-5, 3.0265902468824876e-5];
const MIE_CONST: Rgb = [1.8399918514433978e14, 2.7798023919660528e14, 4.0790479543861094e14];
const RAYLEIGH_ZENITH = 8.4e3;
const MIE_ZENITH = 1.25e3;
const CUTOFF_ANGLE = 1.6110731556870734;
const STEEPNESS = 1.5;
/** Scene units per unit of the model's radiance: sets how bright the sky is next to the sun light. */
export const SKY_SCALE = 0.105;

const map3 = (f: (i: number) => number): Rgb => [f(0), f(1), f(2)];

/**
 * CPU side of the sky model: the scattering coefficients the sky shader needs, and the colour the sun has
 * left after crossing the air, so the sun light, the fog and the sky all come from one atmosphere.
 */
export class Atmosphere {
  constructor(readonly options: AtmosphereOptions = DEFAULT_ATMOSPHERE) {}

  /** Sun strength (0..1) for a sun at height `sunY` (direction y): fades out just below the horizon. */
  sunStrength(sunY: number): number {
    const zenith = Math.acos(Math.min(1, Math.max(-1, sunY)));
    return Math.max(0, 1 - Math.exp(-(CUTOFF_ANGLE - zenith) / STEEPNESS));
  }

  /** Blue-sky and haze scattering coefficients (per metre) for a sun at height `sunY`. */
  coefficients(sunY: number, overcast = 0): { betaR: Rgb; betaM: Rgb } {
    const { turbidity, rayleigh, mieCoefficient } = this.options;
    // The blue thins as the sun sinks (three.js's "sunfade"), which reddens the low sky.
    const fade = 1 - Math.min(1, Math.max(0, 1 - Math.exp(sunY * 0.45)));
    const r = rayleigh - (1 - fade);
    const t = turbidity + 14 * overcast;
    const mie = mieCoefficient * (1 + 4 * overcast);
    return {
      betaR: map3((i) => TOTAL_RAYLEIGH[i] * r),
      betaM: map3((i) => 0.434 * 0.2 * t * 1e-17 * MIE_CONST[i] * mie),
    };
  }

  /** Share of light (per channel) that survives the air along a ray at height `dirY` (direction y). */
  extinction(dirY: number, sunY: number, overcast = 0): Rgb {
    const { betaR, betaM } = this.coefficients(sunY, overcast);
    const zenith = Math.acos(Math.max(0, Math.min(1, dirY)));
    const degrees = (zenith * 180) / Math.PI;
    const inverse = 1 / (Math.cos(zenith) + 0.15 * Math.pow(93.885 - degrees, -1.253));
    return map3((i) => Math.exp(-(betaR[i] * RAYLEIGH_ZENITH + betaM[i] * MIE_ZENITH) * inverse));
  }

  /** Clear-sky radiance (scene units) towards `dir`, the same sum as `skyScatter` in the shader. */
  skyRadiance(dir: Vec3, sun: Vec3, overcast = 0): Rgb {
    const { betaR, betaM } = this.coefficients(sun.y, overcast);
    const fex = this.extinction(dir.y, sun.y, overcast);
    const cos = dir.x * sun.x + dir.y * sun.y + dir.z * sun.z;
    const half = cos * 0.5 + 0.5;
    const g = this.options.mieG;
    const rayleighPhase = 0.0596831 * (1 + half * half);
    const miePhase = (0.07957747 * (1 - g * g)) / Math.pow(1 - 2 * g * cos + g * g, 1.5);
    const sunE = 1000 * this.sunStrength(sun.y);
    const low = Math.min(1, Math.max(0, Math.pow(1 - sun.y, 5)));
    return map3((i) => {
      const ratio = (sunE * (betaR[i] * rayleighPhase + betaM[i] * miePhase)) / (betaR[i] + betaM[i]);
      const lin = Math.pow(ratio * (1 - fex[i]), 1.5) * (1 + (Math.sqrt(ratio * fex[i]) - 1) * low);
      return lin * 0.04 * SKY_SCALE;
    });
  }

  /** Linear colour of direct sunlight on the ground, 1 = full white sun overhead in a vacuum. */
  sunColour(sun: Vec3, overcast = 0): Rgb {
    const strength = this.sunStrength(sun.y);
    const fex = this.extinction(sun.y, sun.y, overcast);
    return map3((i) => strength * fex[i]);
  }
}
