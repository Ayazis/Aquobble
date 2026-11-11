/**
 * The drifting cloud pattern, shared by the cloud sheet (`environment`) and the cloud shadows in the lighting
 * patch, so the shadows on the ground move with the clouds overhead. All in world metres and seconds.
 */
export const CLOUD_PATTERN = {
  /** Height of the cloud sheet. */
  altitude: 240,
  /** Noise cycles per metre. */
  scale: 0.0022,
  /** Pattern units per second the clouds drift. */
  windX: 0.006,
  windZ: 0.002,
  /** Shape values over which a cloud goes from clear to solid: the coverage. */
  coverLow: 0.5,
  coverHigh: 0.58,
  /**
   * GLSL: `cloudShape(xz, time, octaves)` is the fbm cloud shape at world position `xz`. Four octaves for
   * the sky, two for shadows (the missing octaves add about 0.09 on average).
   */
  glsl: /* glsl */ `
  float cloudHash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float cloudNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(cloudHash(i), cloudHash(i + vec2(1.0, 0.0)), u.x),
      mix(cloudHash(i + vec2(0.0, 1.0)), cloudHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float cloudShape(vec2 xz, float time, int octaves) {
    vec2 p = xz * CLOUD_SCALE + vec2(time * CLOUD_WIND_X, time * CLOUD_WIND_Z);
    // One cheap low-frequency sample pushes the pattern around so the clumps billow instead of sliding.
    p += 0.6 * cloudNoise(p * 0.7 - time * 0.004);
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      if (i >= octaves) break;
      sum += amp * cloudNoise(p);
      p = p * 2.03 + vec2(17.0, 9.0);
      amp *= 0.5;
    }
    return sum;
  }
`,
} as const;
