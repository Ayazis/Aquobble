import type { GroundRect } from './GroundRect';
import type { TownPlot } from './TownPlot';

/** Width and reach (m) of the ground kept free in front of a door. */
const WIDTH = 1.8;
const REACH = 1.8;

/** The point `out` metres in front of a building's door. Every town model has its door on its front (local +z). */
export function doorPoint(plot: TownPlot, out = 0): { x: number; z: number } {
  const reach = plot.footprint.depth / 2 + out;
  return { x: plot.x + Math.sin(plot.rotation) * reach, z: plot.z + Math.cos(plot.rotation) * reach };
}

/** The ground in front of a building's door that must stay free of props and lamps. */
export function doorZone(plot: TownPlot): GroundRect {
  const p = doorPoint(plot, REACH / 2);
  return { x: p.x, z: p.z, halfWidth: WIDTH / 2, halfDepth: REACH / 2, rotation: plot.rotation };
}
