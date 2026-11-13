import type { DayKeyframe, DayLighting } from './DayKeyframe';

const FIELDS: readonly (keyof DayLighting)[] = [
  'sunIntensity',
  'hemisphereIntensity',
  'environmentIntensity',
  'fogDensity',
  'exposure',
  'gradeSaturation',
  'gradeContrast',
  'gradeLift',
];

/** Lighting at `time` (wrapped into [0, 1)), interpolated between the surrounding keyframes (sorted by time). */
export function sampleDayCycle(keyframes: readonly DayKeyframe[], time: number): DayLighting {
  if (keyframes.length === 0) throw new Error('sampleDayCycle needs at least one keyframe');
  const t = time - Math.floor(time);
  let next = keyframes.findIndex((k) => k.time > t);
  if (next === -1) next = 0;
  const prev = (next - 1 + keyframes.length) % keyframes.length;
  const a = keyframes[prev];
  const b = keyframes[next];
  const span = wrap(b.time - a.time) || 1;
  const f = wrap(t - a.time) / span;
  const out = {} as DayLighting;
  for (const key of FIELDS) out[key] = a[key] + (b[key] - a[key]) * f;
  return out;
}

/** Per-channel linear blend of two 0xRRGGBB colours. */
export function lerpColor(a: number, b: number, f: number): number {
  let out = 0;
  for (const shift of [16, 8, 0]) {
    const channel = Math.round(lerp((a >> shift) & 0xff, (b >> shift) & 0xff, f));
    out |= channel << shift;
  }
  return out;
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

function wrap(x: number): number {
  return x - Math.floor(x);
}
