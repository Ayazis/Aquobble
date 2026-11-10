import type { TownPlot } from './TownPlot';
import { sizedPlot as prop } from './sizedPlot';

/** North-east: the tavern's yard and the smithy's stock. */
const NORTH_EAST: TownPlot[] = [
  prop('barrel', 10.4, 3),
  prop('barrel', 10.4, 3.9),
  prop('barrel', 9.6, 3.4),
  prop('barrel', 10.5, 6.5),
  prop('crate', 10.3, 8, 0.3),
  prop('crate', 10.4, 9, -0.2),
  prop('bench', 7.5, 6.6, Math.PI),
  prop('cart', 7.2, 9.6, 0.2),
  prop('hay_bale', 3.2, 11),
  prop('hay_bale', 4.1, 11.2),
  prop('wood_pile', 5.4, 11.4, 0.2),
  prop('stone_pile', 9, 11.6),
  prop('bush', 3.6, 7.6),
  prop('hay_bale', 13, 22.6),
  prop('crate', 16, 22.6, 0.4),
];

/** North-west: the miller's field behind the houses. */
const NORTH_WEST: TownPlot[] = [
  prop('fence', -6, 20.2),
  prop('fence', -13.6, 19.4),
  prop('hay_bale', -3.6, 21.5),
  prop('hay_bale', -4.6, 21.8),
  prop('hay_bale', -5.7, 21.4),
  prop('cart', -8.5, 22, 1.2),
  prop('bush', -12, 21.6),
  prop('bush', -15.5, 21.4),
  prop('bush', -21.5, 20.5),
  prop('wood_pile', -18.6, 20, 0.3),
  prop('barrel', -17.3, 10.6),
  prop('crate', -21, 9.4, 0.2),
  prop('bench', -8.2, 4, Math.PI),
  prop('barrel', -10.6, 12),
];

/** South-west: the stable's paddock under the watchtower. */
const SOUTH_WEST: TownPlot[] = [
  prop('fence', -20.2, -11),
  prop('fence', -20.2, -18.6),
  prop('hay_bale', -19, -12.4),
  prop('hay_bale', -20, -12.6),
  prop('hay_bale', -21.2, -12.3),
  prop('hay_bale', -20.4, -13.6),
  prop('cart', -19.5, -16, 0.4),
  prop('stone_pile', -21, -8),
  prop('bush', -21.6, -5),
  prop('bush', -17.2, -21.6),
  prop('barrel', -3.6, -7.2),
  prop('barrel', -4.5, -7.6),
  prop('crate', -3.6, -8.8, 0.3),
  prop('wood_pile', -4.4, -10, 0.1),
  prop('bush', -12.5, -21.5),
  prop('crate', -10.7, -10.6, -0.2),
];

/** South-east: the sawmill's timber and the barracks' stores. */
const SOUTH_EAST: TownPlot[] = [
  prop('wood_pile', 3.4, -7.2, 0.2),
  prop('wood_pile', 4.9, -7.4, -0.3),
  prop('wood_pile', 4, -8.7, 0.1),
  prop('wood_pile', 3.3, -10.2, 0.4),
  prop('crate', 5, -10.3, 0.2),
  prop('barrel', 12.6, -11.4),
  prop('bush', 12, -22),
  prop('bush', 21.6, -21.6),
  prop('stone_pile', 16.6, -22.2),
  prop('hay_bale', 19.2, -21.4),
  prop('fence', 17.5, -20.6),
];

/** Clutter in the yards and alleys between the buildings, quarter by quarter. */
export const YARD_PROPS: TownPlot[] = [...NORTH_EAST, ...NORTH_WEST, ...SOUTH_WEST, ...SOUTH_EAST];
