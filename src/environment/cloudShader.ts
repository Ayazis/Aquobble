import { cloudPatternDefines } from '@rendering';

/**
 * GLSL for `CloudLayer`: the shared cloud pattern (`CLOUD_PATTERN`, also used for the cloud shadows) in
 * world space, so the pattern stays put while the sheet follows the camera.
 */
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

  ${cloudPatternDefines()}

  void main() {
    float shape = cloudShape(vWorld.xz, time, 4);
    // A narrow threshold gives firm, puffy edges rather than haze.
    float density = smoothstep(CLOUD_COVER_LOW, CLOUD_COVER_HIGH, shape);

    vec3 toCamera = cameraPosition - vWorld;
    // Thins out well before the horizon, so the far sky is clear haze instead of a white band.
    float edge = 1.0 - smoothstep(fadeRadius * 0.12, fadeRadius * 0.7, length(toCamera.xz));

    // Denser cores are shaded; the side towards the sun picks up its colour.
    vec3 view = normalize(-toCamera);
    float towardsSun = pow(max(dot(view, normalize(sunDir)), 0.0), 6.0);
    // Two flat tones: bright body, shaded core.
    float core = smoothstep(0.62, 0.66, shape);
    vec3 color = tint * mix(1.0, 0.8, core) + glow * towardsSun * (1.0 - 0.6 * core);

    gl_FragColor = vec4(color, density * edge * 0.95);
  }
`;
