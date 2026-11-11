import { doorPoint } from './doorZone';
import type { GroundRect } from './GroundRect';
import type { TownLayout } from './TownLayout';
import type { TownStreet } from './TownStreet';

/** Width (m) of the worn track from a door, its longest reach, and the patch kept when no street is near. */
const WIDTH = 1.1;
const MAX_REACH = 7;
const PATCH = 1.4;
/** The track runs this far onto the road's frayed edge so it meets the paving. */
const INTO_ROAD = 0.4;

/** Distance from (x, z) to a street's centreline. */
export function distanceToStreet(street: TownStreet, x: number, z: number): number {
  let best = Infinity;
  for (let i = 1; i < street.points.length; i++) {
    const [a, b] = [street.points[i - 1], street.points[i]];
    const [dx, dz] = [b.x - a.x, b.z - a.z];
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - a.x - dx * t, z - a.z - dz * t));
  }
  return best;
}

/**
 * Worn dirt where feet leave each door: a strip straight out of the front to the nearest street's edge, or a
 * small patch when no street lies within reach. Town-local rectangles.
 */
export function doorPaths(layout: TownLayout): GroundRect[] {
  return layout.buildings.map((plot) => {
    const door = doorPoint(plot);
    const [fx, fz] = [Math.sin(plot.rotation), Math.cos(plot.rotation)];
    let reach = PATCH;
    // March out of the door until the first street's edge.
    for (let d = 0.25; d <= MAX_REACH; d += 0.25) {
      const [x, z] = [door.x + fx * d, door.z + fz * d];
      if (layout.network.streets.some((s) => distanceToStreet(s, x, z) <= s.width / 2)) {
        reach = Math.max(PATCH, d + INTO_ROAD);
        break;
      }
    }
    return {
      x: door.x + (fx * reach) / 2,
      z: door.z + (fz * reach) / 2,
      halfWidth: WIDTH / 2,
      halfDepth: reach / 2,
      rotation: plot.rotation,
    };
  });
}
