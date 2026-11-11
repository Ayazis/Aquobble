import type { GroundPoint } from './GroundPoint';
import type { TownStreet } from './TownStreet';

/** A point on a street's centreline with the unit direction of travel there. */
export interface StreetPoint extends GroundPoint {
  dirX: number;
  dirZ: number;
}

/** A spot beside a street, with the yaw that turns a model's front (+z) towards the road. */
export interface VergePoint extends GroundPoint {
  facing: number;
}

/** Length of the street's centreline. */
export function streetLength(street: TownStreet): number {
  let length = 0;
  for (let i = 1; i < street.points.length; i++) {
    const [a, b] = [street.points[i - 1], street.points[i]];
    length += Math.hypot(b.x - a.x, b.z - a.z);
  }
  return length;
}

/** The point `distance` metres along the street from its first point (clamped to its ends). */
export function pointAlong(street: TownStreet, distance: number): StreetPoint {
  const { points } = street;
  let left = Math.max(0, distance);
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    const [dirX, dirZ] = [(b.x - a.x) / length, (b.z - a.z) / length];
    if (left <= length || i === points.length - 1) {
      const t = Math.min(left, length);
      return { x: a.x + dirX * t, z: a.z + dirZ * t, dirX, dirZ };
    }
    left -= length;
  }
  throw new Error(`street ${street.name} needs two points`);
}

/** The spot `offset` metres beyond the paving edge on `side` (+1 right, -1 left), `distance` along the street. */
export function vergePoint(street: TownStreet, distance: number, side: 1 | -1, offset: number): VergePoint {
  const p = pointAlong(street, distance);
  const [nx, nz] = [p.dirZ * side, -p.dirX * side];
  const out = street.width / 2 + offset;
  return { x: p.x + nx * out, z: p.z + nz * out, facing: Math.atan2(-nx, -nz) };
}

/** The same street walked the other way (from its far end); its sides swap. */
export function reversed(street: TownStreet): TownStreet {
  return { ...street, points: [...street.points].reverse() };
}
