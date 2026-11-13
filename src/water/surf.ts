/** Shared by `surfHeight` (CPU) and `surfGlsl` (GPU): change a number here and both follow. */
export const SURF = {
  /** Seconds (of water time) between two waves reaching the beach. */
  period: 3.4,
  /** The beach slope the wave's travel time assumes; steeper real beaches bunch the lines closer. */
  slope: 0.11,
  /** Crest height (m) where the surf is tallest. */
  height: 0.13,
  /** How far the crest leans towards the beach: 0 is an even wave, towards 1 the front face stands up. */
  lean: 0.6,
  /** The surf starts to rise in water this deep (m), is tallest at `peak` and has spent itself at the waterline. */
  deep: 1.7,
  peak: 0.4,
  /** Waves break (white water) once the water is shallower than this (m). */
  breaking: 0.45,
} as const;

/** The wave's profile over one cycle, 0..1: a steep face towards the beach, a long back, a flat trough. */
function profile(phase: number): number {
  const s = 0.5 + 0.5 * Math.sin(phase + SURF.lean * Math.sin(phase));
  return s * s * s;
}

/** The profile's mean (so the surf does not raise the sea on average) and the phase of its crest. */
export const SURF_SHAPE = (() => {
  let mean = 0;
  for (let i = 0; i < 720; i++) mean += profile((i / 720) * 2 * Math.PI) / 720;
  let crest = Math.PI / 2;
  for (let i = 0; i < 30; i++) crest = Math.PI / 2 - SURF.lean * Math.sin(crest);
  return { mean, crest };
})();

const GRAVITY = 9.81;
const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Phase (radians) of the surf at world (x, z) over still water `depth` m deep: crests where its sine is 1.
 * A wave in shallow water travels at sqrt(g depth), so over a sloping beach it needs 2 sqrt(depth / g) / slope
 * seconds to reach the shore: the phase is the time plus that travel time, which makes the crests follow the
 * depth contours, roll in towards the beach from every side and bunch up as they slow down. Sets arrive
 * unevenly along the beach (the two slow sines).
 */
export function surfPhase(depth: number, x: number, z: number, t: number): number {
  const travel = (2 * Math.sqrt(Math.max(depth, 0) / GRAVITY)) / SURF.slope;
  const uneven = Math.sin(0.071 * x + 0.043 * z) + Math.sin(-0.039 * x + 0.083 * z + 1.7);
  return ((2 * Math.PI) / SURF.period) * (t + travel) + 0.9 * uneven;
}

/** Height (m) of the surf over still water `depth` m deep: peaked crests, long flat troughs. */
export function surfHeight(depth: number, x: number, z: number, t: number): number {
  if (depth <= 0 || depth >= SURF.deep) return 0;
  const envelope = smoothstep(0.03, SURF.peak, depth) * (1 - smoothstep(SURF.peak, SURF.deep, depth));
  return SURF.height * envelope * (profile(surfPhase(depth, x, z, t)) - SURF_SHAPE.mean);
}
