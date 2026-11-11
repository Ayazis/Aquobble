import type { Frontage } from './placeFrontages';
import { sizedPlot } from './sizedPlot';
import type { TownPlot } from './TownPlot';

/**
 * Who lives on which street. Landmarks (tavern, chapel) take the first plot off the square; the blacksmith
 * works by the west gate, the barracks by the south gate; houses fill in. Rows are placed in this order, so earlier rows win corners.
 */
export const TOWN_FRONTAGES: Frontage[] = [
  // The tavern stands back behind a forecourt, clear of the lanterns at the square and the east gate.
  { street: 'east', side: -1, setback: 2.7, buildings: ['tavern'] },
  { street: 'north', side: -1, buildings: ['chapel', 'house_a'] },
  { street: 'west', side: -1, fromGate: true, buildings: ['blacksmith'] },
  { street: 'south', side: 1, fromGate: true, buildings: ['barracks'] },
  { street: 'south', side: 1, buildings: ['house_a'] },
  { street: 'east', side: 1, buildings: ['house_c'] },
  { street: 'west', side: 1, buildings: ['house_a', 'house_b'] },
];

/** Model fronts face +z; these turn them. */
const EAST = Math.PI / 2;

/** Stand on open ground in the corners, against the wall, before the streets fill in. */
export const OPEN_GROUND: TownPlot[] = [sizedPlot('windmill', -19, 17.7, EAST), sizedPlot('watchtower', -20.55, -20.5)];

/** The well in the middle of the square and market stalls along its edges, facing in. */
export const SQUARE_PLOTS: TownPlot[] = [
  sizedPlot('well', 0, 0, EAST), // long side east-west, so the stall rows stay clear
  sizedPlot('market_stall', 2.8, -4.6),
  sizedPlot('market_stall', -2.8, -4.6),
  sizedPlot('market_stall', -2.8, 3.9, Math.PI),
];
