import type { TownPlot } from './TownPlot';

const QUARTER = Math.PI / 2;

const plot = (assetId: string, x: number, z: number, rotation: number, w: number, d: number, h: number): TownPlot => ({
  assetId,
  x,
  z,
  rotation,
  footprint: { width: w, depth: d, height: h },
});

/** Building plots: the well and stalls on the square, then three per block between the roads. */
export const TOWN_BUILDINGS: TownPlot[] = [
  // Central square
  plot('well', 0, 0, 0, 3, 3, 2.5),
  plot('market_stall', 7, -8, 0, 4, 3, 3),
  plot('market_stall', -7, -8, 0, 4, 3, 3),
  // North-east (+x, +z)
  plot('tavern', 22, 22, Math.PI, 12, 10, 9),
  plot('house_a', 40, 10, Math.PI, 8, 8, 7),
  plot('blacksmith', 10, 40, -QUARTER, 10, 8, 6.5),
  // North-west
  plot('chapel', -26, 30, 0, 10, 16, 14),
  plot('house_b', -10, 22, Math.PI, 8, 7, 7),
  plot('house_c', -44, 12, Math.PI, 11, 12, 6),
  // South-west
  plot('watchtower', -48, -48, 0, 6, 6, 12),
  plot('house_a', -22, -22, 0, 8, 8, 7),
  plot('house_b', -40, -10, QUARTER, 8, 7, 7),
  // South-east
  plot('house_c', 22, -22, 0, 11, 12, 6),
  plot('house_a', 40, -30, 0, 8, 8, 7),
  plot('house_b', 10, -40, QUARTER, 7, 8, 7),
];
