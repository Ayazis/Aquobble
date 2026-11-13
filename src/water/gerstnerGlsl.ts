import { SHOAL } from './waveShoaling';

const f = (v: number) => v.toFixed(4);

/** GLSL twin of `waveShoaling`, split in two: the per-pixel surface shoals the swell but never fades it out. */
const WAVE_SHOAL_GLSL = /* glsl */ `
/** x: wavenumber scale, y: amplitude scale, for still water \`depth\` m deep. */
vec2 waveShoalAt(float depth) {
  float s = clamp(depth / ${f(SHOAL.depth)}, 0.0, 1.0);
  return vec2(1.0 / mix(${f(SHOAL.shortest)}, 1.0, s),
    mix(${f(SHOAL.shallows)}, 1.0, s) * smoothstep(0.0, ${f(SHOAL.shore)}, depth));
}

/** The swell dies out before the sea mesh gets coarse (the per-pixel surface carries on). */
float waveMeshFade(vec2 p) {
  return 1.0 - smoothstep(${f(SHOAL.fadeStart)}, ${f(SHOAL.fadeEnd)}, length(p));
}
`;

/**
 * GLSL twin of `GerstnerWaveField` + `waveShoaling`. The wave numbers arrive as uniforms from
 * `gerstnerUniforms`, so CPU and GPU always agree. `uWaveA[i]` = (dirX, dirZ, k, amplitude),
 * `uWaveB[i]` = (omega, phase, pull, 0). Waves are sorted longest first: the mesh is moved by the first
 * `meshCount` only (the ones its vertices can carry), the per-pixel surface uses them all.
 */
export function gerstnerGlsl(count: number, meshCount = count): string {
  const n = Math.max(1, count);
  return /* glsl */ `
#define WAVE_COUNT ${n}
#define WAVE_MESH_COUNT ${Math.min(n, Math.max(1, meshCount))}
uniform vec4 uWaveA[WAVE_COUNT];
uniform vec4 uWaveB[WAVE_COUNT];

${WAVE_SHOAL_GLSL}
/** World-space displacement of the rest point p. */
vec3 gerstnerOffset(vec2 p, float t, vec2 sh) {
  vec3 o = vec3(0.0);
  for (int i = 0; i < WAVE_MESH_COUNT; i++) {
    vec4 a = uWaveA[i];
    vec4 b = uWaveB[i];
    float k = a.z * sh.x;
    float th = k * dot(a.xy, p) - b.x * t + b.y;
    o.xz += a.xy * (b.z / k * min(1.0, sh.y)) * cos(th);
    o.y += a.w * sh.y * sin(th);
  }
  return o;
}

/**
 * Analytic world-space normal at the rest point p, for a pixel \`pixel\` m across. \`fold\` is how much the surface is squeezed sideways
 * there (1 = flat water, towards 0 = a crest about to curl over): where it is low, whitecaps break.
 */
vec3 gerstnerSurface(vec2 p, float t, vec2 sh, float pixel, out float fold) {
  vec3 n = vec3(0.0, 1.0, 0.0);
  vec3 squeeze = vec3(0.0);
  float pull = min(1.0, sh.y);
  for (int i = 0; i < WAVE_COUNT; i++) {
    vec4 a = uWaveA[i];
    vec4 b = uWaveB[i];
    float k = a.z * sh.x;
    float th = k * dot(a.xy, p) - b.x * t + b.y;
    // A wave only a few pixels long would shimmer: it fades into the surface's roughness instead.
    float seen = clamp(1.5 / (k * pixel) - 0.6, 0.0, 1.0);
    float q = b.z * pull * sin(th) * seen;
    n.xz -= a.xy * (k * a.w * sh.y * seen) * cos(th);
    n.y -= q;
    squeeze += vec3(a.x * a.x, a.y * a.y, a.x * a.y) * q;
  }
  fold = (1.0 - squeeze.x) * (1.0 - squeeze.y) - squeeze.z * squeeze.z;
  return normalize(n);
}
`;
}
