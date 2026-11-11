import { MAX_GRASS_BENDERS } from './WindSway';

export const WIND_UNIFORMS = `
uniform float uWindTime;
uniform vec4 uBenders[${MAX_GRASS_BENDERS}];
const vec2 WIND_DIR = vec2(0.94299, 0.33005);
// Gust strength in [0, 1] at a plant root: fronts rolling along the wind, slowly waxing and waning.
float windGust(vec2 root) {
  float g = 0.5 + 0.5 * sin(dot(root, WIND_DIR) * 0.09 - uWindTime * 1.1);
  return g * g * (0.6 + 0.4 * sin(dot(root, vec2(-0.05, 0.07)) + uWindTime * 0.37));
}
// World-space position of a plant vertex at height plantH above its root, pushed by wind and trampling.
vec3 plantDisplace(vec3 plantRoot, vec3 p, float plantH, float strength) {
  float plantBend = plantH * plantH * strength;
  // Wind: a steady lean plus gusts rolling across the field, and per-plant flutter.
  vec2 windDir = WIND_DIR;
  float windAlong = dot(plantRoot.xz, windDir);
  float gust = windGust(plantRoot.xz);
  float flutter = sin(uWindTime * 3.3 + plantRoot.x * 1.7 + plantRoot.z * 1.3);
  vec2 windPush = windDir * (0.25 + gust * 1.2 + flutter * 0.18)
    + vec2(-windDir.y, windDir.x) * sin(uWindTime * 2.1 + windAlong * 0.6) * 0.14;
  windPush *= plantBend;
  // Trampling: characters push blades away from them and press them down.
  vec2 trampleDir = vec2(0.0);
  float trample = 0.0;
  for (int i = 0; i < ${MAX_GRASS_BENDERS}; i++) {
    vec4 b = uBenders[i];
    if (b.w <= 0.0) continue;
    vec2 away = plantRoot.xz - b.xz;
    float dist = length(away);
    float reach = 1.0 - smoothstep(b.w * 0.35, b.w, dist);
    reach *= 1.0 - smoothstep(1.6, 2.6, b.y - plantRoot.y);
    trampleDir += (dist > 0.001 ? away / dist : vec2(1.0, 0.0)) * reach;
    trample = max(trample, reach);
  }
  float trampleLen = length(trampleDir);
  trampleDir = trampleLen > 0.001 ? trampleDir / trampleLen : vec2(0.0);
  vec2 push = mix(windPush, trampleDir * plantH * 1.4, trample);
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
