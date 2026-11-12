/**
 * Refraction and reflection (desktop, lane H). Reads the opaque scene from `SCENE_COLOUR_UNIFORMS`: behind
 * the water for what shows through it, and along the mirrored ray for what it reflects.
 *
 * Looking through: the scene behind, wobbled by the wave normal, loses its red first and then its green with
 * every metre of water crossed, so shallows are clear turquoise and depths blue. The water's own lit colour
 * is scaled by how opaque it has become and the scene is added as emission, so the surface draws opaque.
 *
 * Mirroring: a short march through the scene depth along the reflected ray (longer steps further out). Where
 * it lands on the island, that colour replaces the sky the material would otherwise reflect there.
 * With `uRefraction` 0 (phones) nothing changes.
 */
export const WATER_REFRACTION_PARS = /* glsl */ `
uniform sampler2D uSceneColour;
uniform vec2 uSceneResolution;
uniform mat4 uSceneProjection;
uniform float uRefraction;
`;

const STEPS = 22;

/** Runs after the normal is known and before lighting (at the emissive map hook). */
export const WATER_FRAGMENT_REFRACTION = /* glsl */ `
if (uRefraction > 0.5) {
  vec2 screen = gl_FragCoord.xy / uSceneResolution;
  float here = vViewPosition.z;
  vec4 straight = texture2D(uSceneColour, screen);
  float reach = smoothstep(0.0, 1.5, straight.a - here);
  vec4 behind = texture2D(uSceneColour, screen + normal.xy * 0.03 * reach);
  // Never refract something that stands in front of the water.
  if (behind.a < here) behind = straight;
  // No valid depth behind (empty or unresolved copy): draw plain lit water, never the dark copy.
  float thick = behind.a > here + 0.01 ? behind.a - here : 1e4;
  vec3 through = exp(-thick * vec3(0.46, 0.12, 0.085)) * (1.0 - waterFoam);
  float opacity = 1.0 - dot(through, vec3(0.3333));
  totalEmissiveRadiance += behind.rgb * through;
  diffuseColor.rgb *= opacity;
  diffuseColor.a = 1.0;

#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
  vec3 toSurface = normalize(-vViewPosition);
  vec3 mirror = reflect(toSurface, normal);
  // Keep the ray above the water: a ripple tilted away would otherwise send it into the sea bed.
  vec3 mirrorWorld = (vec4(mirror, 0.0) * viewMatrix).xyz;
  mirrorWorld.y = max(mirrorWorld.y, 0.04);
  mirror = normalize((viewMatrix * vec4(mirrorWorld, 0.0)).xyz);
  float stride = 0.5;
  float t = stride * (0.5 + fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))));
  vec4 mirrored = vec4(0.0);
  for (int i = 0; i < ${STEPS}; i++) {
    vec3 q = -vViewPosition + mirror * t;
    vec4 clip = uSceneProjection * vec4(q, 1.0);
    vec2 uv = clip.xy / clip.w * 0.5 + 0.5;
    if (clip.w <= 0.0 || min(uv.x, uv.y) < 0.0 || max(uv.x, uv.y) > 1.0) break;
    vec4 scene = texture2D(uSceneColour, uv);
    float behindScene = -q.z - scene.a;
    if (behindScene > 0.0 && behindScene < 1.0 + t * 0.4) {
      float edge = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
      mirrored = vec4(scene.rgb, smoothstep(0.0, 0.06, edge));
      break;
    }
    stride *= 1.3;
    t += stride;
  }
  float fresnel = 0.02 + 0.98 * pow(1.0 - saturate(dot(-toSurface, normal)), 5.0);
  vec3 sky = getIBLRadiance(-toSurface, normal, roughnessFactor);
  totalEmissiveRadiance += (mirrored.rgb - sky) * fresnel * mirrored.a * (1.0 - waterFoam);
#endif
}
`;
