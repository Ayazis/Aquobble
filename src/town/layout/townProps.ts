import { SQUARE_PROPS } from './squareProps';
import type { TownPlot } from './TownPlot';
import { YARD_PROPS } from './yardProps';

/** Every small prop in the town, at true size. */
export const TOWN_PROPS: TownPlot[] = [...SQUARE_PROPS, ...YARD_PROPS];
