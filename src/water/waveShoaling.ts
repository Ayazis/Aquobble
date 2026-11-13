/** Shared by `GerstnerWaveField` (CPU) and `gerstnerGlsl` (GPU): change a number here and both follow. */
export const SHOAL = {
  /** Water deeper than this (m) carries the waves unchanged. */
  depth: 6,
  /** Wavelength factor in the shallows: waves bunch up as the water gets shallow. */
  shortest: 0.8,
  /** Amplitude factor in the shallows: the bed drags on the swell, so bays lie calmer than open water (the surf takes over). */
  shallows: 0.6,
  /** Over the last `shore` metres of depth the waves die into the foam line. */
  shore: 0.5,
  /** The swell fades out between these distances (m) from the world centre, before the sea mesh gets coarse. */
  fadeStart: 105,
  fadeEnd: 133,
} as const;

/** Wavenumber and amplitude multipliers at one spot. */
export interface WaveScale {
  kScale: number;
  ampScale: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Still-water `depth` (m) and `distance` (m) from the world centre to wave scale. Mirrors `waveShoal` in GLSL. */
export function waveShoaling(depth: number, distance: number): WaveScale {
  const s = clamp01(depth / SHOAL.depth);
  const fade = 1 - smoothstep(SHOAL.fadeStart, SHOAL.fadeEnd, distance);
  return {
    kScale: 1 / mix(SHOAL.shortest, 1, s),
    ampScale: mix(SHOAL.shallows, 1, s) * smoothstep(0, SHOAL.shore, depth) * fade,
  };
}
