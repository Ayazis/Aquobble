const STEPS = 28;
const REFINE = 4;

/**
 * Mirroring (desktop): a march through the scene's depth along the reflected ray, in steps that lengthen
 * with distance, then a few halvings to land on the surface it crossed. Where the ray finds the island, a
 * rock or a boat, that colour replaces the sky the material would otherwise reflect there; it fades out
 * towards the edge of the screen, beyond which nothing is known.
 */
export const WATER_FRAGMENT_REFLECTION = /* glsl */ `
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
vec3 wToSurface = normalize(-vViewPosition);
float wFresnel = 0.02 + 0.98 * pow(1.0 - saturate(dot(-wToSurface, normal)), 5.0);
// Looking steeply down, water mirrors next to nothing: not worth the march.
if (uRefraction > 0.5 && wFresnel > 0.03) {
  vec3 wMirror = reflect(wToSurface, normal);
  // Keep the ray above the water: a ripple tilted away would otherwise send it into the sea bed.
  vec3 wMirrorWorld = (vec4(wMirror, 0.0) * viewMatrix).xyz;
  wMirrorWorld.y = max(wMirrorWorld.y, 0.03);
  wMirror = normalize((viewMatrix * vec4(wMirrorWorld, 0.0)).xyz);
  float wStride = 0.4;
  float wNear = 0.0;
  float wFar = wStride * (0.5 + fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))));
  vec4 wMirrored = vec4(0.0);
  for (int i = 0; i < ${STEPS}; i++) {
    vec3 q = -vViewPosition + wMirror * wFar;
    vec4 clip = uSceneProjection * vec4(q, 1.0);
    vec2 uv = clip.xy / clip.w * 0.5 + 0.5;
    if (clip.w <= 0.0 || min(uv.x, uv.y) < 0.0 || max(uv.x, uv.y) > 1.0) break;
    float past = -q.z - texture2D(uSceneColour, uv).a;
    if (past > 0.0 && past < 1.2 + wFar * 0.45) {
      for (int j = 0; j < ${REFINE}; j++) {
        float mid = 0.5 * (wNear + wFar);
        q = -vViewPosition + wMirror * mid;
        clip = uSceneProjection * vec4(q, 1.0);
        uv = clip.xy / clip.w * 0.5 + 0.5;
        if (-q.z - texture2D(uSceneColour, uv).a > 0.0) wFar = mid;
        else wNear = mid;
      }
      q = -vViewPosition + wMirror * wFar;
      clip = uSceneProjection * vec4(q, 1.0);
      uv = clip.xy / clip.w * 0.5 + 0.5;
      float edge = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
      wMirrored = vec4(texture2D(uSceneColour, uv).rgb, smoothstep(0.0, 0.07, edge));
      break;
    }
    wNear = wFar;
    wStride *= 1.25;
    wFar += wStride;
  }
  vec3 wSky = getIBLRadiance(-wToSurface, normal, roughnessFactor);
  totalEmissiveRadiance += (wMirrored.rgb - wSky) * wFresnel * wMirrored.a * (1.0 - waterFoam);
}
#endif
`;
