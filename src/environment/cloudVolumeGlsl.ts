import { cloudPatternDefines } from '@rendering';

/** Thickness of the cloud slab above `CLOUD_PATTERN.altitude` (m). */
export const CLOUD_THICKNESS = 230;

/**
 * GLSL for the volumetric clouds: a slab of cumulus whose footprint is the shared cloud pattern (so the
 * shadows on the ground lie under the clouds overhead), domed on top, flat underneath, lit by marching
 * towards the key light. `marchClouds` returns premultiplied colour and coverage along a view ray.
 */
export function cloudVolumeGlsl(steps: number): string {
  return /* glsl */ `
${cloudPatternDefines()}
#define CLOUD_THICKNESS ${CLOUD_THICKNESS.toFixed(1)}
#define CLOUD_STEPS ${steps}
#define CLOUD_SIGMA 0.04
uniform vec3 uCloudCam;
uniform float uCloudTime;
uniform float uCloudCover;
uniform vec3 uCloudLightDir;
uniform vec3 uCloudLight;
uniform vec3 uCloudAmbient;

float cloudDensity(vec3 p, int octaves) {
  float h = (p.y - CLOUD_ALTITUDE) / CLOUD_THICKNESS;
  if (h < 0.0 || h > 1.0) return 0.0;
  float shape = cloudShape(p.xz, uCloudTime, octaves) + 0.045 * float(4 - octaves);
  // Higher up less of the pattern clears the threshold: domed tops over a flat base.
  float threshold = CLOUD_COVER_LOW - uCloudCover + 0.36 * h * h;
  float d = (shape - threshold) * 9.0;
  if (octaves > 2) {
    // Wisps: a skewed noise slice eats into the edges.
    float wisp = cloudNoise(p.xz * 0.011 + p.y * vec2(0.017, 0.012) + uCloudTime * 0.015) * 0.65
      + cloudNoise(p.xz * 0.031 - p.y * vec2(0.023, 0.041) - uCloudTime * 0.02) * 0.35;
    d -= wisp * 1.1 * (1.0 - clamp(d, 0.0, 1.0));
  }
  return clamp(d, 0.0, 1.0) * smoothstep(0.0, 0.07, h);
}

float cloudHenyey(float c, float g) {
  float g2 = g * g;
  return (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * c, 1.5);
}

// rgb = light scattered towards the viewer (premultiplied), a = how much of the sky behind is covered.
vec4 marchClouds(vec3 rd, float jitter) {
  if (rd.y < 0.015) return vec4(0.0);
  float t0 = (CLOUD_ALTITUDE - uCloudCam.y) / rd.y;
  float t1 = min((CLOUD_ALTITUDE + CLOUD_THICKNESS - uCloudCam.y) / rd.y, t0 + 2600.0);
  float dt = (t1 - t0) / float(CLOUD_STEPS);
  float t = t0 + dt * jitter;
  float cosTheta = dot(rd, uCloudLightDir);
  // Forward lobe for the silver lining, a broad back lobe so clouds away from the sun stay bright.
  float phase = 0.6 * cloudHenyey(cosTheta, 0.55) + 0.4 * cloudHenyey(cosTheta, -0.2);
  float transmit = 1.0;
  vec3 light = vec3(0.0);
  for (int i = 0; i < CLOUD_STEPS; i++) {
    vec3 p = uCloudCam + rd * t;
    float d = cloudDensity(p, 4);
    if (d > 0.002) {
      float depth = cloudDensity(p + uCloudLightDir * 25.0, 3) * 35.0
        + cloudDensity(p + uCloudLightDir * 70.0, 2) * 60.0
        + cloudDensity(p + uCloudLightDir * 150.0, 2) * 100.0;
      // Beer's law plus a slow second term for light that scatters round inside the cloud.
      float lit = max(exp(-depth * CLOUD_SIGMA), 0.4 * exp(-depth * CLOUD_SIGMA * 0.25));
      float h = (p.y - CLOUD_ALTITUDE) / CLOUD_THICKNESS;
      vec3 scatter = uCloudLight * (lit * phase * 0.46) + uCloudAmbient * mix(0.32, 0.85, h);
      float a = 1.0 - exp(-d * CLOUD_SIGMA * dt);
      light += transmit * a * scatter;
      transmit *= 1.0 - a;
      if (transmit < 0.02) break;
    }
    t += dt;
  }
  return vec4(light, 1.0 - transmit);
}
`;
}
