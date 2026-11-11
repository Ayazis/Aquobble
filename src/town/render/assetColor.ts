import { COLOUR_SCRIPT } from '@rendering'; // lane E: palette

/** Placeholder colours per asset id, so grey boxes are told apart until real models arrive. */
// lane E: palette (swatches from COLOUR_SCRIPT.buildings)
const COLORS: Record<string, number> = {
  house_a: COLOUR_SCRIPT.buildings.plaster[0],
  house_b: COLOUR_SCRIPT.buildings.plaster[1],
  house_c: COLOUR_SCRIPT.buildings.plaster[2],
  tavern: 0x9c6b3f,
  blacksmith: 0x5e5550,
  chapel: COLOUR_SCRIPT.buildings.plaster[3],
  watchtower: 0x7d756c,
  well: 0x8f8a84,
  market_stall: COLOUR_SCRIPT.buildings.cloth,
  barrel: 0x7a5230,
  crate: 0xa57b4c,
  cart: COLOUR_SCRIPT.buildings.darkTimber,
  bench: COLOUR_SCRIPT.buildings.timber,
  lantern_post: COLOUR_SCRIPT.buildings.iron,
  hay_bale: COLOUR_SCRIPT.buildings.hay,
  fence: 0x8a6a45,
  sign_post: 0x6b4e30,
  bush: COLOUR_SCRIPT.buildings.shrub,
  stone_pile: COLOUR_SCRIPT.buildings.stone,
};

export function assetColor(assetId: string): number {
  return COLORS[assetId] ?? 0x999999;
}
