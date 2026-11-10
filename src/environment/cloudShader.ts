/** GLSL for `CloudLayer`: fbm noise in world space, so the pattern stays put while the sheet follows the camera. */
export const CLOUD_VERTEX = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const CLOUD_FRAGMENT = /* glsl */ `
  uniform float time;
  uniform vec3 tint;
  uniform vec3 glow;
  uniform vec3 sunDir;
  uniform float fadeRadius;
  varying vec3 vWorld;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      sum += amp * noise(p);
      p = p * 2.03 + vec2(17.0, 9.0);
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    vec2 uv = vWorld.xz * 0.0022 + vec2(time * 0.006, time * 0.002);
    float shape = fbm(uv + 0.5 * fbm(uv * 1.7 - time * 0.004));
    float density = smoothstep(0.5, 0.78, shape);

    vec3 toCamera = cameraPosition - vWorld;
    float edge = 1.0 - smoothstep(fadeRadius * 0.35, fadeRadius, length(toCamera.xz));

    // Denser cores are shaded; the side towards the sun picks up its colour.
    vec3 view = normalize(-toCamera);
    float towardsSun = pow(max(dot(view, normalize(sunDir)), 0.0), 6.0);
    vec3 color = tint * mix(1.0, 0.72, density) + glow * towardsSun * (1.0 - 0.6 * density);

    gl_FragColor = vec4(color, density * edge * 0.85);
  }
`;
