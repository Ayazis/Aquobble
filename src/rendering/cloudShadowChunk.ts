import { cloudPatternDefines } from './cloudPatternDefines';

/**
 * GLSL for the lighting patch: how much of the sun reaches a point through the clouds. Only the sun is
 * dimmed (street lamps and the moon are not), and it costs nothing while `strength` is 0, i.e. at night.
 */
export function cloudShadowChunk(): string {
  return /* glsl */ `
  uniform vec4 cloudShadowParams;
  uniform vec4 cloudShadowSun;
  ${cloudPatternDefines()}

  float cloudShadowFactor(vec3 lightDirView, vec3 viewPosition) {
    vec3 sunWorld = cloudShadowSun.xyz;
    if (cloudShadowParams.y <= 0.0 || sunWorld.y < 0.02) return 1.0;
    // directLight.direction is in view space: only the light that is the sun gets the cloud shadow.
    if (dot(lightDirView, (viewMatrix * vec4(sunWorld, 0.0)).xyz) < 0.999) return 1.0;
    vec3 world = cameraPosition + (vec4(viewPosition, 0.0) * viewMatrix).xyz;
    // Follow the ray towards the sun up to the cloud sheet.
    vec2 xz = world.xz + sunWorld.xz * ((CLOUD_ALTITUDE - world.y) / sunWorld.y);
    float shape = cloudShape(xz, cloudShadowParams.x, 2) + 0.09;
    float cover = smoothstep(CLOUD_COVER_LOW - 0.03, CLOUD_COVER_HIGH + 0.03, shape);
    return 1.0 - cloudShadowParams.y * cover;
  }
`;
}
