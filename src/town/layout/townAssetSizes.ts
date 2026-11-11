import type { Footprint } from './Footprint';

const size = (width: number, depth: number, height: number): Footprint => ({ width, depth, height });

/**
 * The one true size of every town model, in metres, with the model's own proportions, against a 1.6 m
 * character (GameConfig `scale`). Yardstick: a door is about 1.25x character height (2 m). Seats sit at
 * about 0.45 m (bench), counters near waist height (market stall), barrels 0.9 m. The windmill is a 13 m
 * landmark, the watchtower (15 m) clearly overtops the 3.5 m wall, and smithy and stable are grown until
 * their doors clear a person. Lantern posts are 4.5 m so they read across the square; lamp glow, light pool
 * and point-light height are derived from this footprint. Tavern and chapel keep smaller doors rather than
 * outgrow the town. Every plot of an asset uses this footprint, so all copies match.
 */
export const TOWN_ASSET_SIZES = {
  house_a: size(5.54, 6.86, 8.75),
  house_b: size(6.4, 9.86, 9.38),
  house_c: size(13.49, 14.79, 7.48),
  tavern: size(16.62, 16.59, 14.4),
  blacksmith: size(11.11, 9.38, 8.58),
  chapel: size(8.78, 10.12, 21.6),
  watchtower: size(5.18, 5.33, 15.0),
  barracks: size(9.7, 10.6, 10.45),
  windmill: size(10.81, 7.58, 13.0),
  sawmill: size(14.96, 11.15, 9.72),
  stable: size(16.92, 11.99, 8.96),
  well: size(3.33, 5.03, 6.25), // 2.5x: reads as the square's centrepiece
  market_stall: size(2.37, 2.96, 2.61),
  barrel: size(0.69, 0.69, 0.9),
  crate: size(0.8, 0.8, 0.8),
  cart: size(0.93, 1.87, 1.6),
  bench: size(1.7, 0.62, 0.81),
  lantern_post: size(0.87, 2.14, 4.5),
  hay_bale: size(0.68, 0.7, 1),
  fence: size(6.44, 0.18, 1.2),
  sign_post: size(1.69, 0.42, 2),
  bush: size(2.09, 2.09, 1.2),
  stone_pile: size(3.24, 0.59, 0.96),
  wood_pile: size(0.84, 0.8, 0.71),
} satisfies Record<string, Footprint>;

export type TownAssetId = keyof typeof TOWN_ASSET_SIZES;
