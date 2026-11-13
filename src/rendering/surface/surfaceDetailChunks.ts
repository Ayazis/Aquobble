/** GLSL injected into MeshStandardMaterial by `SurfaceDetailLibrary`: a world-space triplanar detail texture. */

export const DETAIL_VERTEX_PARS = /* glsl */ `
varying vec3 vDetailPos;
`;

export const DETAIL_VERTEX_MAIN = /* glsl */ `
#ifdef USE_INSTANCING
  vDetailPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
#else
  vDetailPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif
`;

export const DETAIL_FRAGMENT_PARS = /* glsl */ `
uniform sampler2D uDetailMap;
uniform float uDetailStrength;
uniform float uDetailScale;
uniform sampler2D uDetailNormalMap;
uniform float uDetailNormalStrength;
varying vec3 vDetailPos;
// Brightness of the detail texture at this pixel, read as height by the relief chunk.
float detailHeight = 1.0;

// Texture colour divided by its own average, so the material colour stays the overall tint.
vec3 surfaceDetail(vec2 uv) {
  vec3 mean = max(textureLod(uDetailMap, vec2(0.5), 16.0).rgb, vec3(0.04));
  return clamp(texture2D(uDetailMap, uv).rgb / mean, 0.0, 2.0);
}
`;

export const DETAIL_FRAGMENT_MAIN = /* glsl */ `
if (uDetailStrength > 0.0) {
  // Face normal from screen-space derivatives: crisp per-facet projection that suits flat-shaded low-poly.
  vec3 n = normalize(cross(dFdx(vDetailPos), dFdy(vDetailPos)));
  vec3 w = pow(abs(n), vec3(4.0));
  w /= (w.x + w.y + w.z);
  vec3 p = vDetailPos * uDetailScale;
  vec3 detail = surfaceDetail(p.zy) * w.x + surfaceDetail(p.xz) * w.y + surfaceDetail(p.xy) * w.z;
  diffuseColor.rgb *= mix(vec3(1.0), detail, uDetailStrength);
  detailHeight = dot(detail, vec3(0.3333)) * uDetailStrength;
}
`;

/** Depth (m) of the relief between the darkest and the average tone of a detail texture. */
export const DETAIL_RELIEF_DEPTH = 0.022;

/**
 * Relief without a normal map, placed after three.js has set the view-space `normal`: the detail texture's
 * brightness is read as height (mortar lines and plank gaps are dark, so they sink) and its screen-space
 * slope tilts the normal, as in bump mapping. No extra texture reads.
 */
export const DETAIL_RELIEF_MAIN = /* glsl */ `
{
  vec2 dH = vec2(dFdx(detailHeight), dFdy(detailHeight)) * ${DETAIL_RELIEF_DEPTH.toFixed(3)};
  vec3 sx = dFdx(vViewPosition);
  vec3 sy = dFdy(vViewPosition);
  vec3 r1 = cross(sy, normal);
  vec3 r2 = cross(normal, sx);
  float det = dot(sx, r1) * faceDirection;
  // vViewPosition points at the camera (the surface position negated), which flips the gradient's sign.
  vec3 grad = sign(det) * (dH.x * r1 + dH.y * r2);
  normal = normalize(abs(det) * normal + grad);
}
`;

/** How much the steepest carved slopes darken (0 = none): the joints between stones hold dirt and shade. */
export const DETAIL_CREVICE_DARKEN = 0.35;

/**
 * Carved detail on upward faces, placed after three.js has set the view-space `normal`: the ground-plane
 * normal map tilts it, so sun and sky catch the stone edges. Slopes are also darkened a little, as the
 * joints between stones are in real paving.
 */
export const DETAIL_NORMAL_MAIN = /* glsl */ `
if (uDetailNormalStrength > 0.0) {
  float up = smoothstep(0.7, 0.95, dot(normal, (viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz));
  if (up > 0.0) {
    vec3 t = texture2D(uDetailNormalMap, vDetailPos.xz * uDetailScale).xyz * 2.0 - 1.0;
    float carve = up * uDetailNormalStrength;
    // Tangent space on the ground: u along +x, v along +z, normal up.
    vec3 viewN = normalize((viewMatrix * vec4(t.x, t.z, t.y, 0.0)).xyz);
    normal = normalize(mix(normal, viewN, carve));
    diffuseColor.rgb *= 1.0 - ${DETAIL_CREVICE_DARKEN.toFixed(2)} * carve * min(length(t.xy), 1.0);
  }
}
`;
