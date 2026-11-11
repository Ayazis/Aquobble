/** Placeholder colours per asset id, so grey boxes are told apart until real models arrive. */
const COLORS: Record<string, number> = {
  house_a: 0xb3a07e,
  house_b: 0xb9a07a,
  house_c: 0xb5a88b,
  tavern: 0x9c6b3f,
  blacksmith: 0x5e5550,
  chapel: 0xbdb7ab,
  watchtower: 0x7d756c,
  well: 0x8f8a84,
  market_stall: 0xb5523b,
  barrel: 0x7a5230,
  crate: 0xa57b4c,
  cart: 0x6e4b2a,
  bench: 0x7a5a3a,
  lantern_post: 0x333333,
  hay_bale: 0xd8bf5a,
  fence: 0x8a6a45,
  sign_post: 0x6b4e30,
  bush: 0x3f6e35,
  stone_pile: 0x8c8c8c,
};

export function assetColor(assetId: string): number {
  return COLORS[assetId] ?? 0x999999;
}
