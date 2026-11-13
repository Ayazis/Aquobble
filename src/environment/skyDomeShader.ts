import { ATMOSPHERE_PARS } from './atmosphereGlsl';
import { CLOUD_MAP_UV } from './cloudMapShader';

/** Pins the dome to the far plane, so its size never matters and everything else draws over it. */
export const SKY_DOME_VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vDir = world.xyz - cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * world;
  gl_Position.z = gl_Position.w;
}
`;

/**
 * The clear sky: daylight scattering, the night gradient, the afterglow on the sun's side once it has set,
 * and (with `sunDisc`) the sun itself as a small very bright disc that bloom turns into a glare.
 */
export function skyDomeFragment(sunDisc: boolean): string {
  return /* glsl */ `
varying vec3 vDir;
uniform vec3 uSunDisc;
uniform vec3 uNightZenith;
uniform vec3 uNightHorizon;
uniform vec3 uTwilight;
${ATMOSPHERE_PARS}
void main() {
  vec3 dir = normalize(vDir);
  vec3 up = normalize(vec3(dir.x, max(dir.y, 0.0), dir.z));
  vec3 Fex;
  vec3 colour = skyScatter(up, Fex);
  colour += mix(uNightHorizon, uNightZenith, pow(up.y, 0.45));
  float sunSide = dot(normalize(dir.xz + 1e-5), normalize(uSunDir.xz + 1e-5));
  colour += uTwilight * exp(-up.y * 6.0) * (0.3 + 0.7 * pow(max(sunSide, 0.0), 2.0));
  ${sunDisc ? 'colour += uSunDisc * smoothstep(0.99989, 0.99995, dot(dir, uSunDir)) * step(0.0, dir.y);' : ''}
  // Below the horizon lies the haze over the sea: the horizon colour, sinking darker.
  colour *= mix(1.0, 0.45, smoothstep(0.0, -0.25, dir.y));
  gl_FragColor = vec4(colour, 1.0);
}
`;
}

/** The cloud map laid over the sky (premultiplied): stars and the sun stay behind the clouds. */
export const CLOUD_DOME_FRAGMENT = /* glsl */ `
varying vec3 vDir;
uniform sampler2D uCloudMap;
uniform float uCloudTexel;
${CLOUD_MAP_UV}
void main() {
  vec3 dir = normalize(vDir);
  if (dir.y <= 0.0) discard;
  // Four taps on a rotated square: smooths the map's march grain without softening the cloud shapes much.
  vec2 uv = cloudMapUv(dir);
  vec4 o = vec4(0.75, 0.25, -0.25, -0.75) * uCloudTexel;
  gl_FragColor = 0.25 * (texture2D(uCloudMap, uv + o.xy) + texture2D(uCloudMap, uv + o.zx)
    + texture2D(uCloudMap, uv + o.wz) + texture2D(uCloudMap, uv + o.yw));
}
`;
