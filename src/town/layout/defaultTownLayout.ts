import { SeededRandom } from '@core';
import { buildTownLayout } from './buildTownLayout';
import type { TownLayout } from './TownLayout';

/** Seed of the village plan. Fixed, so models, lighting and townsfolk can read the same town before the world. */
export const TOWN_LAYOUT_SEED = 1207;

/** The 52 x 52 m walled village, laid out by code from its roads (see `buildTownLayout`). */
export const DEFAULT_TOWN_LAYOUT: TownLayout = buildTownLayout(new SeededRandom(TOWN_LAYOUT_SEED).fork('town-layout'));
