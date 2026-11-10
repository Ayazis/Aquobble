import type { Footprint } from './Footprint';

const size = (width: number, depth: number, height: number): Footprint => ({ width, depth, height });

/**
 * The one true size of every town model, in metres, with the model's own proportions: each was measured
 * next to the 1.8 m character and scaled so doors, seats and rails are person-sized. Every plot of an asset
 * uses this footprint, so all copies of a model come out the same size and nothing is squeezed to fit.
 */
export const TOWN_ASSET_SIZES = {
  house_a: size(5.98, 7.41, 9.45),
  house_b: size(5.12, 7.89, 7.5),
  house_c: size(7.04, 7.72, 3.9),
  tavern: size(11.43, 11.41, 9.9),
  blacksmith: size(10.53, 8.89, 8.13),
  chapel: size(6.83, 7.87, 16.8),
  watchtower: size(3.45, 3.55, 10),
  well: size(1.33, 2.01, 2.5),
  market_stall: size(2.72, 3.4, 3),
  sawmill: size(10.56, 7.87, 6.86),
  stable: size(10.81, 7.66, 5.73),
  barracks: size(8.73, 9.54, 9.4),
  windmill: size(6.03, 4.23, 7.25),
  barrel: size(0.77, 0.77, 1),
  crate: size(0.8, 0.8, 0.8),
  cart: size(1.31, 2.63, 2.25),
  bench: size(1.89, 0.69, 0.9),
  lantern_post: size(0.51, 1.26, 2.66),
  hay_bale: size(0.68, 0.7, 1),
  fence: size(5.8, 0.16, 1.08),
  sign_post: size(1.69, 0.42, 2),
  bush: size(2.09, 2.09, 1.2),
  stone_pile: size(3.24, 0.59, 0.96),
  wood_pile: size(1.12, 1.06, 0.94),
} satisfies Record<string, Footprint>;

export type TownAssetId = keyof typeof TOWN_ASSET_SIZES;
