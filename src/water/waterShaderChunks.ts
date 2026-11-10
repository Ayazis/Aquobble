/** GLSL injected into MeshStandardMaterial by `WaterMeshFactory`: rippling normals and drifting foam flecks. */

export const WATER_VERTEX_PARS = /* glsl */ `
varying vec3 vWaterPos;
`;

export const WATER_VERTEX_MAIN = /* glsl */ `
vWaterPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
`;

export const WATER_FRAGMENT_PARS = /* glsl */ `
uniform sampler2D uWaterNormals;
uniform float uWaterTime;
varying vec3 vWaterPos;
`;

/** Brightens the surface where two drifting ripple layers line up: cheap stylised foam flecks. */
export const WATER_FRAGMENT_COLOR = /* glsl */ `
{
  vec2 p = vWaterPos.xz;
  float a = texture2D(uWaterNormals, p * 0.08 + uWaterTime * vec2(0.012, 0.007)).r;
  float b = texture2D(uWaterNormals, p * 0.13 - uWaterTime * vec2(0.009, 0.013)).g;
  float fleck = smoothstep(0.66, 0.7, a * b * 2.0);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), fleck * 0.6);
  diffuseColor.a = mix(diffuseColor.a, 1.0, fleck);
}
`;

/** The surface is a flat horizontal plane, so the ripple normal is built in world space directly. */
export const WATER_FRAGMENT_NORMAL = /* glsl */ `
{
  vec2 p = vWaterPos.xz;
  vec3 n1 = texture2D(uWaterNormals, p * 0.06 + uWaterTime * vec2(0.02, 0.012)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uWaterNormals, p * 0.021 - uWaterTime * vec2(0.008, 0.014)).xyz * 2.0 - 1.0;
  vec2 ripple = (n1.xy + n2.xy) * 0.35;
  normal = normalize((viewMatrix * vec4(normalize(vec3(ripple.x, 1.0, ripple.y)), 0.0)).xyz);
}
`;
