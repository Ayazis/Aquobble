import { HEIGHT_MAP_GLSL } from '@terrain';

/**
 * GLSL injected into MeshStandardMaterial by `WaterMeshFactory`. The water knows the ground under it from
 * the terrain's height texture, so it has a shoreline: pale clear shallows, darker deep water and a foam
 * line that laps at the beach. `uWaterCalm` is 0 for the sea and 1 for a pond.
 */
export const WATER_VERTEX_PARS = /* glsl */ `
uniform float uWaterTime;
uniform float uWaterSwell;
varying vec3 vWaterPos;
`;

/** The mesh is a plane built in XY and laid flat, so local z is up. The swell fades out before the mesh gets coarse. */
export const WATER_VERTEX_MAIN = /* glsl */ `
vec3 waterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
if (uWaterSwell > 0.0) {
  float swell = sin(waterWorld.x * 0.11 + uWaterTime * 1.5) * 0.6
    + sin(waterWorld.z * 0.17 - waterWorld.x * 0.05 + uWaterTime * 2.1) * 0.4;
  swell *= uWaterSwell * (1.0 - smoothstep(110.0, 150.0, length(waterWorld.xz)));
  transformed.z += swell;
  waterWorld.y += swell;
}
vWaterPos = waterWorld;
`;

export const WATER_FRAGMENT_PARS = /* glsl */ `
uniform sampler2D uWaterNormals;
uniform float uWaterTime;
uniform float uWaterCalm;
uniform vec3 uWaterShallow;
varying vec3 vWaterPos;
${HEIGHT_MAP_GLSL}
`;

export const WATER_FRAGMENT_COLOR = /* glsl */ `
{
  vec2 p = vWaterPos.xz;
  float depth = vWaterPos.y - groundHeightAt(p);
  float shallow = 1.0 - smoothstep(0.0, 1.8, depth);
  float deep = smoothstep(2.0, 7.0, depth);
  // Pale and clear over the shallows, darker and more solid over deep water; ponds are darker throughout.
  diffuseColor.rgb = mix(diffuseColor.rgb, uWaterShallow, shallow * 0.6) * mix(1.0, 0.7, deep);
  diffuseColor.rgb *= mix(1.0, 0.6, uWaterCalm);
  diffuseColor.a = mix(mix(diffuseColor.a, 0.4, shallow), 1.0, deep * 0.5);
  // Foam flecks on the open sea: streaks along the wind, where two drifting layers line up, fading with distance.
  vec2 s = vec2(dot(p, vec2(0.94, 0.33)), dot(p, vec2(-0.33, 0.94)));
  float a = texture2D(uWaterNormals, s * vec2(0.028, 0.085) + uWaterTime * vec2(0.012, 0.004)).r;
  float b = texture2D(uWaterNormals, s * vec2(0.043, 0.12) - uWaterTime * vec2(0.007, 0.006)).g;
  float near = 1.0 - smoothstep(60.0, 220.0, distance(vWaterPos, cameraPosition));
  float fleck = smoothstep(0.8, 0.84, a * b * 2.0) * near * (1.0 - uWaterCalm) * (1.0 - shallow);
  // Shore foam: a thin solid edge at the waterline and bands that travel in towards it.
  float lap = sin(depth * 22.0 + uWaterTime * 2.2 + a * 5.0);
  float foam = (1.0 - smoothstep(0.08, 0.32, depth)) * smoothstep(0.55, 0.8, lap) * 0.75;
  foam = max(foam, 1.0 - smoothstep(0.02, 0.06 + 0.06 * b, depth));
  foam *= mix(1.0, 0.3, uWaterCalm);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), max(fleck * 0.6, foam));
  diffuseColor.a = mix(diffuseColor.a, 1.0, max(fleck, foam));
}
`;

/** The surface is close to a flat horizontal plane, so the ripple normal is built in world space directly. */
export const WATER_FRAGMENT_NORMAL = /* glsl */ `
{
  vec2 p = vWaterPos.xz;
  vec3 n1 = texture2D(uWaterNormals, p * 0.06 + uWaterTime * vec2(0.02, 0.012)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uWaterNormals, p * 0.021 - uWaterTime * vec2(0.008, 0.014)).xyz * 2.0 - 1.0;
  vec2 ripple = (n1.xy + n2.xy) * 0.35 * mix(1.0, 0.4, uWaterCalm);
  normal = normalize((viewMatrix * vec4(normalize(vec3(ripple.x, 1.0, ripple.y)), 0.0)).xyz);
}
`;

/** A broken path of glints towards the sun (or moon): ripples that mirror it straight at the viewer flash its colour. */
export const WATER_FRAGMENT_GLITTER = /* glsl */ `
#if NUM_DIR_LIGHTS > 0
{
  vec3 halfway = normalize(directionalLights[0].direction + normalize(vViewPosition));
  float path = smoothstep(0.15, 0.9, pow(max(dot(normal, halfway), 0.0), 140.0));
  // Only scattered wave tips flash, and they twinkle as two fine ripple layers slide past each other.
  vec2 g = vWaterPos.xz;
  float tips = texture2D(uWaterNormals, g * 0.37 + uWaterTime * vec2(0.05, 0.03)).r
    * texture2D(uWaterNormals, g * 0.53 - uWaterTime * vec2(0.04, 0.06)).g;
  float glint = path * smoothstep(0.3, 0.36, tips);
  totalEmissiveRadiance += directionalLights[0].color * glint * 0.3 * (1.0 - uWaterCalm * 0.6);
}
#endif
`;
