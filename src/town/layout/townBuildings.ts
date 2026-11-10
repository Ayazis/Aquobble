import type { TownPlot } from './TownPlot';
import { sizedPlot as plot } from './sizedPlot';

/** Model fronts face +z; these turn them towards the lane they stand on. */
const NORTH = 0;
const SOUTH = Math.PI;
const EAST = Math.PI / 2;
const WEST = -Math.PI / 2;

/**
 * Building plots at true size, packed wall to wall like a walled village: the well and stalls on the square,
 * one landmark per quarter with houses filling in around it, leaving only alleys and small yards.
 */
export const TOWN_BUILDINGS: TownPlot[] = [
  // Central square
  plot('well', 0, 0),
  plot('market_stall', 3.4, -3.3),
  plot('market_stall', -3.4, -3.3),
  plot('market_stall', -3.4, 3.3, SOUTH),
  // North-east (+x, +z): the tavern fills the quarter, with its yard along both lanes
  plot('tavern', 14.5, 14.5, SOUTH),
  // North-west: bell tower on the north lane, windmill in the corner
  plot('chapel', -7.36, 13.99, EAST),
  plot('house_a', -12.6, 5.73, SOUTH),
  plot('house_b', -19.5, 7.23, SOUTH),
  plot('house_a', -15.77, 16.03, SOUTH),
  plot('windmill', -20.75, 19.6, EAST),
  // South-west: barracks on the west lane, watchtower in the corner
  plot('barracks', -17.85, -7.6, NORTH),
  plot('house_a', -9.27, -5.73, NORTH),
  plot('house_b', -7.23, -13.2, EAST),
  plot('house_a', -5.73, -19.97, EAST),
  plot('watchtower', -20.55, -20.5, NORTH),
  // South-east: stone hall on the east lane, smithy on the south lane
  plot('house_c', 16.87, -8.73, NORTH),
  plot('blacksmith', 6.57, -11.05, WEST),
  plot('house_a', 5.73, -19.67, WEST),
  plot('house_b', 14.93, -19.35, WEST),
];
