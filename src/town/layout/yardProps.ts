import type { TownPlot } from './TownPlot';
import { sizedPlot as prop } from './sizedPlot';

const QUARTER = Math.PI / 2;

/** North-east: the tavern's yard, wrapped around it along both lanes. */
const NORTH_EAST: TownPlot[] = [
  prop('barrel', 11, 4.8),
  prop('barrel', 11.9, 5.1),
  prop('barrel', 11.3, 3.9),
  prop('bench', 8, 4.8, Math.PI),
  prop('cart', 15, 4.2, 1.3),
  prop('crate', 18.5, 4.9, 0.3),
  prop('crate', 19.5, 5, -0.2),
  prop('hay_bale', 21.3, 4.6),
  prop('hay_bale', 22.2, 5.1),
  prop('wood_pile', 3.3, 7.3, 0.2),
  prop('wood_pile', 4.9, 7.9, -0.3),
  prop('barrel', 5, 11),
  prop('barrel', 5.1, 12),
  prop('bench', 3.4, 14.5, QUARTER),
  prop('crate', 4.8, 16.6, 0.4),
  prop('bush', 4.2, 19.4),
  prop('hay_bale', 4.6, 21.9),
  prop('hay_bale', 3.6, 22.3),
];

/** North-west: the churchyard behind the bell tower and the miller's field. */
const NORTH_WEST: TownPlot[] = [
  prop('bench', -7.7, 4, Math.PI),
  prop('bush', -7.5, 7.6),
  prop('barrel', -3.4, 7),
  prop('fence', -7.5, 19.1),
  prop('stone_pile', -5.6, 20.4),
  prop('stone_pile', -8.8, 21.6),
  prop('bush', -4.8, 21.8),
  prop('bush', -11.95, 22),
  prop('fence', -15.4, 20),
  prop('hay_bale', -13.4, 21.6),
  prop('hay_bale', -14.4, 21.9),
  prop('cart', -17, 21.9, 1.2),
  prop('crate', -20.5, 13.5, 0.2),
  prop('barrel', -21.6, 14.2),
  prop('wood_pile', -20, 15.3, 0.3),
];

/** South-west: the barracks' drill yard under the watchtower. */
const SOUTH_WEST: TownPlot[] = [
  prop('barrel', -3.5, -7),
  prop('barrel', -4.4, -7.5),
  prop('crate', -3.6, -8.7, 0.3),
  prop('fence', -17.6, -13.6),
  prop('hay_bale', -14, -15),
  prop('hay_bale', -15, -15.4),
  prop('hay_bale', -16.2, -14.8),
  prop('crate', -20, -15.2, 0.2),
  prop('crate', -21.1, -15.6, -0.3),
  prop('barrel', -22.2, -14.6),
  prop('wood_pile', -11, -18.4, 0.1),
  prop('wood_pile', -11.2, -20.2, -0.2),
  prop('stone_pile', -14.4, -19.6),
  prop('bush', -15.5, -21.7),
  prop('cart', -13.6, -17, 1.4),
];

/** South-east: the smithy's stock and the back gardens. */
const SOUTH_EAST: TownPlot[] = [
  prop('barrel', 7, -4),
  prop('crate', 8.2, -4.4, 0.2),
  prop('wood_pile', 9.7, -3.8, 0.3),
  prop('bush', 21.6, -17.4),
  prop('hay_bale', 21.3, -19.8),
  prop('barrel', 22, -21.4),
  prop('crate', 21, -22.3, 0.3),
];

/** Clutter in the yards and alleys between the buildings, quarter by quarter. */
export const YARD_PROPS: TownPlot[] = [...NORTH_EAST, ...NORTH_WEST, ...SOUTH_WEST, ...SOUTH_EAST];
