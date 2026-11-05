import type { TownPlot } from './TownPlot';

const QUARTER = Math.PI / 2;
/** Small yaw offsets so the houses don't sit on a perfect grid. */
const SKEW = 0.05;

const plot = (assetId: string, x: number, z: number, rotation: number, w: number, d: number, h: number): TownPlot => ({
  assetId,
  x,
  z,
  rotation,
  footprint: { width: w, depth: d, height: h },
});

/**
 * Building plots at real-world scale (cottages ~6 m wide and ~6.5 m to the ridge), packed tightly along the lanes
 * like a walled village: the well and stalls on the square, four or five buildings per quarter.
 */
export const TOWN_BUILDINGS: TownPlot[] = [
  // Central square
  plot('well', 0, 0, 0, 2.2, 2.2, 3),
  plot('market_stall', 4, -4.5, 0, 3, 2.2, 2.6),
  plot('market_stall', -4, -4.5, 0, 3, 2.2, 2.6),
  // North-east (+x, +z)
  plot('tavern', 9, 11, Math.PI, 9, 8, 8),
  plot('house_a', 19.5, 6.5, Math.PI + SKEW, 6, 6, 6.5),
  plot('blacksmith', 8, 20.5, -QUARTER, 7, 6, 5.5),
  plot('house_b', 19, 17, Math.PI, 6, 5.5, 6.5),
  // North-west
  plot('chapel', -12, 15, 0, 8, 13, 12),
  plot('house_b', -4.6, 11, Math.PI, 5, 6, 6.5),
  plot('house_a', -4.6, 20, Math.PI, 5, 6, 6.5),
  plot('house_c', -21, 6, Math.PI, 7, 8, 5.5),
  plot('windmill', -21, 17, QUARTER, 4, 4, 7),
  // South-west
  plot('watchtower', -21.5, -21.5, 0, 4, 4, 10),
  plot('house_a', -10, -11, SKEW, 6, 6, 6.5),
  plot('house_b', -19, -9, QUARTER, 6, 5.5, 6.5),
  plot('stable', -9, -21, 0, 8, 5.6, 4.5),
  // South-east
  plot('house_c', 11, -11, 0, 7, 8, 5.5),
  plot('barracks', 20, -8, 0, 6, 6, 6.5),
  plot('sawmill', 22, -14, 0, 6, 4.5, 4),
  plot('house_b', 6, -20, QUARTER, 5.5, 6, 6.5),
  plot('house_a', 16, -20, -SKEW, 5.8, 5.8, 6.5),
];
