import type { TownPlot } from './TownPlot';
import { sizedPlot as plot } from './sizedPlot';

/** Model fronts face +z; these turn them towards the lane they stand on. */
const NORTH = 0;
const SOUTH = Math.PI;
const EAST = Math.PI / 2;
const WEST = -Math.PI / 2;

/**
 * Building plots at true size, packed wall to wall like a walled village: the well and stalls on the square,
 * five or six buildings per quarter with only alleys and small yards between them.
 */
export const TOWN_BUILDINGS: TownPlot[] = [
  // Central square
  plot('well', 0, 0),
  plot('market_stall', 3.4, -3.3),
  plot('market_stall', -3.4, -3.3),
  plot('market_stall', -3.4, 3.3, SOUTH),
  // North-east (+x, +z): tavern on the east lane, smithy on the north lane
  plot('tavern', 17.1, 8, SOUTH),
  plot('blacksmith', 6.75, 17.55, WEST),
  plot('house_a', 15, 18.1, SOUTH),
  plot('house_b', 20.6, 18.35, SOUTH),
  // North-west: chapel by the square, windmill in the corner
  plot('chapel', -6.25, 9.9, EAST),
  plot('house_c', -14.5, 6.15, SOUTH),
  plot('windmill', -20.7, 5.5, EAST),
  plot('house_b', -6.25, 16.55, EAST),
  plot('house_a', -14, 14.7, SOUTH),
  plot('house_b', -20.6, 14.2, SOUTH),
  // South-west: stable on the south lane, watchtower in the corner
  plot('stable', -6.15, -16.9, EAST),
  plot('house_a', -10, -6, NORTH),
  plot('house_b', -16.55, -6.25, NORTH),
  plot('house_a', -14, -15.2, NORTH),
  plot('watchtower', -21.15, -21, NORTH),
  // South-east: barracks on the east lane, sawmill on the south lane
  plot('house_c', 9.7, -6.15, NORTH),
  plot('barracks', 17.85, -7.05, NORTH),
  plot('sawmill', 6.25, -16.8, WEST),
  plot('house_b', 13.55, -16.45, NORTH),
  plot('house_a', 19.8, -16.2, NORTH),
];
