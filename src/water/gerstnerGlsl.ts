import { SHOAL } from './waveShoaling';

const f = (v: number) => v.toFixed(4);

/**
 * GLSL twin of `GerstnerWaveField` + `waveShoaling` (needs `groundHeightAt` from the terrain's height map).
 * The wave numbers arrive as uniforms from `gerstnerUniforms`, so CPU and GPU always agree.
 * `uWaveA[i]` = (dirX, dirZ, k, amplitude), `uWaveB[i]` = (omega, phase, pull, 0).
 */
export function gerstnerGlsl(count: number): string {
  return /* glsl */ `
#define WAVE_COUNT ${Math.max(1, count)}
uniform vec4 uWaveA[WAVE_COUNT];
uniform vec4 uWaveB[WAVE_COUNT];

/** x: wavenumber scale, y: amplitude scale, for still water at height level over world xz. */
vec2 waveShoal(vec2 p, float level) {
  float depth = level - groundHeightAt(p);
  float s = clamp(depth / ${f(SHOAL.depth)}, 0.0, 1.0);
  float fade = 1.0 - smoothstep(${f(SHOAL.fadeStart)}, ${f(SHOAL.fadeEnd)}, length(p));
  return vec2(1.0 / mix(${f(SHOAL.shortest)}, 1.0, s),
    mix(${f(SHOAL.tallest)}, 1.0, s) * smoothstep(0.0, ${f(SHOAL.shore)}, depth) * fade);
}

/** World-space displacement of the rest point p. */
vec3 gerstnerOffset(vec2 p, float t, vec2 sh) {
  vec3 o = vec3(0.0);
  for (int i = 0; i < WAVE_COUNT; i++) {
    vec4 a = uWaveA[i];
    vec4 b = uWaveB[i];
    float k = a.z * sh.x;
    float th = k * dot(a.xy, p) - b.x * t + b.y;
    o.xz += a.xy * (b.z / k * min(1.0, sh.y)) * cos(th);
    o.y += a.w * sh.y * sin(th);
  }
  return o;
}

/** Analytic world-space normal at the rest point p. */
vec3 gerstnerNormal(vec2 p, float t, vec2 sh) {
  vec3 n = vec3(0.0, 1.0, 0.0);
  for (int i = 0; i < WAVE_COUNT; i++) {
    vec4 a = uWaveA[i];
    vec4 b = uWaveB[i];
    float k = a.z * sh.x;
    float th = k * dot(a.xy, p) - b.x * t + b.y;
    n.xz -= a.xy * (k * a.w * sh.y) * cos(th);
    n.y -= b.z * min(1.0, sh.y) * sin(th);
  }
  return normalize(n);
}
`;
}
