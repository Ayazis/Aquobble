import type { GroundShade, GroundShadeChannel } from './GroundShade';

/** A rectangle of ground (world x/z, half sizes in metres), turned by `rotation` radians around +y. */
export interface ShadeRectangle {
  x: number;
  z: number;
  halfWidth: number;
  halfDepth: number;
  rotation: number;
}

/**
 * Darkens the ground under and around a rectangle (a building, a crate, a run of wall): full `strength`
 * (0..1) inside it, easing to nothing `margin` metres out. Overlaps add up softly, as with `GroundShade.stamp`.
 */
export function stampRectangle(
  shade: GroundShade,
  rect: ShadeRectangle,
  margin: number,
  strength: number,
  channel: GroundShadeChannel = 'contact',
): void {
  const { size, resolution, data } = shade;
  const texel = size / resolution;
  const cos = Math.cos(rect.rotation);
  const sin = Math.sin(rect.rotation);
  const reach = Math.hypot(rect.halfWidth, rect.halfDepth) + margin;
  const toTexel = (v: number) => (v + size / 2) / texel - 0.5;
  const last = resolution - 1;
  const offset = channel === 'contact' ? 0 : 1;
  const rows = [Math.max(Math.floor(toTexel(rect.z - reach)), 0), Math.min(Math.ceil(toTexel(rect.z + reach)), last)];
  const columns = [
    Math.max(Math.floor(toTexel(rect.x - reach)), 0),
    Math.min(Math.ceil(toTexel(rect.x + reach)), last),
  ];
  for (let row = rows[0]; row <= rows[1]; row++) {
    for (let column = columns[0]; column <= columns[1]; column++) {
      const dx = (column + 0.5) * texel - size / 2 - rect.x;
      const dz = (row + 0.5) * texel - size / 2 - rect.z;
      // Into the rectangle's own frame (local x along its width), then distance outside it.
      const outX = Math.max(Math.abs(dx * cos - dz * sin) - rect.halfWidth, 0);
      const outZ = Math.max(Math.abs(dx * sin + dz * cos) - rect.halfDepth, 0);
      const t = 1 - Math.hypot(outX, outZ) / margin;
      if (t <= 0) continue;
      const i = (row * resolution + column) * 2 + offset;
      const added = strength * t * t * (3 - 2 * t);
      data[i] = Math.round((1 - (1 - data[i] / 255) * (1 - added)) * 255);
    }
  }
}
