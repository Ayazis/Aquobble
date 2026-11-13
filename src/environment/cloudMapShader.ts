import { ATMOSPHERE_PARS } from './atmosphereGlsl';
import { cloudVolumeGlsl } from './cloudVolumeGlsl';

/**
 * Shaders that draw the volumetric clouds into the cloud map: a square texture holding the upper half of
 * the sky as a fisheye (the zenith in the middle, the horizon on the unit circle). `CLOUD_MAP_DIR` and
 * `CLOUD_MAP_UV` are the two directions of that mapping.
 */
export const CLOUD_MAP_UV = /* glsl */ `
vec2 cloudMapUv(vec3 dir) {
  return dir.xz / (1.0 + dir.y) * 0.5 + 0.5;
}
`;

export const CLOUD_MAP_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export function cloudMapFragment(steps: number): string {
  return /* glsl */ `
varying vec2 vUv;
uniform vec3 uSkyNight;
uniform float uCloudJitter;
${ATMOSPHERE_PARS}
${cloudVolumeGlsl(steps)}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) { gl_FragColor = vec4(0.0); return; }
  float y = (1.0 - r2) / (1.0 + r2);
  vec3 rd = vec3(p.x * (1.0 + y), y, p.y * (1.0 + y));
  // Interleaved gradient noise shifts each ray's first step, differently on every redraw: slice banding
  // becomes a grain that averages away as redraws blend into the map.
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float jitter = fract(ign + uCloudJitter);
  vec4 cloud = marchClouds(rd, jitter);
  // Aerial perspective: far clouds sink into the sky colour behind them and are gone before the horizon.
  float dist = (CLOUD_ALTITUDE - uCloudCam.y) / max(rd.y, 0.015);
  vec3 Fex;
  vec3 sky = skyScatter(rd, Fex) + uSkyNight;
  cloud.rgb = mix(sky * cloud.a, cloud.rgb, exp(-dist * 0.0002));
  gl_FragColor = cloud * (1.0 - smoothstep(4500.0, 9000.0, dist));
}
`;
}
