import type { Vec3 } from '@core';

const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

/**
 * Moves `center` to the nearest point that sits on a whole shadow-map texel as seen from the light, so a
 * shadow box that follows the player slides in texel steps and its shadows do not shimmer. The axes match
 * three.js `lookAt` from the light (world up = +y), and the depth along the light is left unchanged.
 * `towardsLight` is the unit direction to the light, `boxSize` the box width, `mapSize` the map resolution.
 */
export function snapToShadowTexels(center: Vec3, towardsLight: Vec3, boxSize: number, mapSize: number): Vec3 {
  const z = normalize(towardsLight);
  const up = Math.abs(z.y) > 0.999 ? { x: 0, y: 0, z: 1 } : { x: 0, y: 1, z: 0 };
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  const texel = boxSize / mapSize;
  const a = Math.round(dot(center, x) / texel) * texel;
  const b = Math.round(dot(center, y) / texel) * texel;
  const c = dot(center, z);
  return {
    x: x.x * a + y.x * b + z.x * c,
    y: x.y * a + y.y * b + z.y * c,
    z: x.z * a + y.z * b + z.z * c,
  };
}
