import { SURF, SURF_SHAPE } from './surf';

const f = (v: number) => v.toFixed(5);

/**
 * GLSL twin of `surf.ts` (same numbers), plus what only the picture needs: the swash that runs up the sand
 * after each wave, and the white water behind a breaking crest.
 */
export const SURF_GLSL = /* glsl */ `
float surfPhase(float depth, vec2 p, float t) {
  float travel = 2.0 * sqrt(max(depth, 0.0) / 9.81) / ${f(SURF.slope)};
  float uneven = sin(dot(p, vec2(0.071, 0.043))) + sin(dot(p, vec2(-0.039, 0.083)) + 1.7);
  return ${f((2 * Math.PI) / SURF.period)} * (t + travel) + 0.9 * uneven;
}
float surfEnvelope(float depth) {
  return smoothstep(0.03, ${f(SURF.peak)}, depth) * (1.0 - smoothstep(${f(SURF.peak)}, ${f(SURF.deep)}, depth));
}
float surfHeight(float depth, vec2 p, float t) {
  float phase = surfPhase(depth, p, t);
  float s = 0.5 + 0.5 * sin(phase + ${f(SURF.lean)} * sin(phase));
  return ${f(SURF.height)} * surfEnvelope(depth) * (s * s * s - ${f(SURF_SHAPE.mean)});
}
/** How long ago the last crest passed, as a share of the period: 0 right behind the crest, 1 just ahead of the next. */
float surfSince(float depth, vec2 p, float t) {
  return fract((surfPhase(depth, p, t) - ${f(SURF_SHAPE.crest)}) / 6.28318);
}
/** The swash at the waterline, 0..1: shoots up the sand as a wave arrives, drains back slowly. */
float surfSwash(vec2 p, float t) {
  float since = surfSince(0.0, p, t);
  return smoothstep(0.0, 0.12, since) * (1.0 - since) * (1.0 - since);
}
/** White water left behind a broken crest, 0..1: a sharp front, a tail that fizzles out. */
float surfBore(float depth, vec2 p, float t) {
  float since = surfSince(depth, p, t);
  float broken = (1.0 - smoothstep(${f(SURF.breaking)}, ${f(SURF.breaking * 2.1)}, depth)) * smoothstep(0.0, 0.05, depth);
  return broken * exp(-since * 4.5) * smoothstep(0.0, 0.03, since);
}
`;
