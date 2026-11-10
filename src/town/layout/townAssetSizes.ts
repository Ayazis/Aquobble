import type { Footprint } from './Footprint';

const size = (width: number, depth: number, height: number): Footprint => ({ width, depth, height });

/**
 * The one true size of every town model, in metres, with the model's own proportions. Props are at their
 * native size, which already suits the 1.8 m character (0.5 m seats, 1 m barrels). Buildings are scaled up
 * until a storey is about 2.5 m and the door about person-height; the models are stylised and disagree on
 * door size, so the two landmarks (tavern, chapel) keep smaller doors rather than outgrow the town.
 * Every plot of an asset uses this footprint, so all copies match and nothing is squeezed to fit.
 */
export const TOWN_ASSET_SIZES = {
  house_a: size(5.54, 6.86, 8.75),
  house_b: size(6.4, 9.86, 9.38),
  house_c: size(11.73, 12.86, 6.5),
  tavern: size(16.62, 16.59, 14.4),
  blacksmith: size(10.1, 8.53, 7.8),
  chapel: size(8.78, 10.12, 21.6),
  watchtower: size(4.49, 4.62, 13.0),
  barracks: size(9.7, 10.6, 10.45),
  windmill: size(6.03, 4.23, 7.25),
  sawmill: size(14.96, 11.15, 9.72),
  stable: size(14.1, 9.99, 7.47),
  well: size(1.33, 2.01, 2.5),
  market_stall: size(2.72, 3.4, 3),
  barrel: size(0.77, 0.77, 1),
  crate: size(0.8, 0.8, 0.8),
  cart: size(1.04, 2.1, 1.8),
  bench: size(1.89, 0.69, 0.9),
  lantern_post: size(0.46, 1.13, 2.38),
  hay_bale: size(0.68, 0.7, 1),
  fence: size(6.44, 0.18, 1.2),
  sign_post: size(1.69, 0.42, 2),
  bush: size(2.09, 2.09, 1.2),
  stone_pile: size(3.24, 0.59, 0.96),
  wood_pile: size(0.84, 0.8, 0.71),
} satisfies Record<string, Footprint>;

export type TownAssetId = keyof typeof TOWN_ASSET_SIZES;
