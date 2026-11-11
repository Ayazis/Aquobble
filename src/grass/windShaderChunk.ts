import { windShaderChunk } from '@wind';
import { BEND_MAP_GLSL } from './BendUniforms';

/** Plant shader declarations: the shared wind chunk (`windGust`, `uWindTime`), the bend map and `plantDisplace`. */
export const WIND_UNIFORMS = `
${windShaderChunk}
${BEND_MAP_GLSL}
// World-space position of a plant vertex at height plantH above its root, pushed by wind and trampling.
vec3 plantDisplace(vec3 plantRoot, vec3 p, float plantH, float strength) {
  float plantBend = plantH * plantH * strength;
  // Wind: a lean with the base strength, gust fronts rolling across the field, and per-plant flutter.
  vec2 windDir = uWindDirection;
  float windAlong = dot(plantRoot.xz, windDir);
  float gust = windGust(plantRoot.xz);
  float breeze = 0.3 + uWindStrength;
  float flutter = sin(uWindTime * 3.3 + plantRoot.x * 1.7 + plantRoot.z * 1.3);
  vec2 windPush = windDir * (0.1 + uWindStrength * 0.45 + gust * 1.6 + flutter * 0.14 * breeze)
    + vec2(-windDir.y, windDir.x) * sin(uWindTime * 2.1 + windAlong * 0.6) * 0.11 * breeze;
  windPush *= plantBend;
  // Trampling: the bend map's push (read once per plant root) springs blades over and back.
  vec2 bend = bendAt(plantRoot.xz).xy;
  float trample = clamp(length(bend), 0.0, 1.0);
  vec2 push = mix(windPush, bend * plantH * 1.4, trample);
  p.xz += push;
  // Keep blade length roughly constant: the further it leans, the lower the tip.
  p.y -= min(dot(push, push) * 0.6 / max(plantH, 0.05), plantH * 0.85) + trample * plantH * 0.25;
  return p;
}
`;

/**
 * Replaces three's project_vertex: works in world space so wind and trampling push the same way
 * whatever the instance yaw. Bend grows with height above the base (local y); far plants shrink away, and
 * with a `fadeIn` range (end above 0) near plants are shrunk away too.
 */
export function windProjectVertex(
  strength: number,
  fadeStart: number,
  fadeEnd: number,
  fadeIn: readonly number[] = [0, 0],
): string {
  return `
vec4 plantWorld = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
  plantWorld = instanceMatrix * plantWorld;
  vec3 plantRoot = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz;
#else
  vec3 plantRoot = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
#endif
plantWorld = modelMatrix * plantWorld;
float plantH = max(position.y, 0.0);
plantWorld.xyz = plantDisplace(plantRoot, plantWorld.xyz, plantH, ${strength.toFixed(3)});

${plantFadeGlsl(fadeStart, fadeEnd, fadeIn)}
plantWorld.xyz = plantRoot + (plantWorld.xyz - plantRoot) * plantFade;

vec4 mvPosition = viewMatrix * plantWorld;
gl_Position = projectionMatrix * mvPosition;
`;
}

/** GLSL for `plantFade`: the plant's size factor at its camera distance. */
function plantFadeGlsl(fadeStart: number, fadeEnd: number, fadeIn: readonly number[]): string {
  const f = (v: number) => v.toFixed(3);
  const grow = fadeIn[1] > 0 ? `plantFade *= smoothstep(${f(fadeIn[0])}, ${f(fadeIn[1])}, plantDist);` : '';
  return `float plantDist = distance(plantRoot, cameraPosition);
float plantFade = 1.0 - smoothstep(${f(fadeStart)}, ${f(fadeEnd)}, plantDist);
${grow}`;
}
