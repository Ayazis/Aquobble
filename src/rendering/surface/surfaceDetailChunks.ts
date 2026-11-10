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
varying vec3 vDetailPos;

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
}
`;
