/** A rectangle of ground that cannot be walked on, centred on (x, z) and turned by `rotation`. */
export interface NavObstacle {
  x: number;
  z: number;
  /** Half the size along the rectangle's own x and z axes. */
  halfWidth: number;
  halfDepth: number;
  /** Yaw in radians around +y (the three.js convention). */
  rotation: number;
}

/** Distance on the ground from a point to the obstacle's edge; 0 inside it. */
export function distanceToObstacle(o: NavObstacle, x: number, z: number): number {
  const dx = x - o.x;
  const dz = z - o.z;
  const cos = Math.cos(o.rotation);
  const sin = Math.sin(o.rotation);
  const localX = dx * cos - dz * sin;
  const localZ = dx * sin + dz * cos;
  return Math.hypot(Math.max(Math.abs(localX) - o.halfWidth, 0), Math.max(Math.abs(localZ) - o.halfDepth, 0));
}
