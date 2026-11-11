import type { CharacterLook } from './CharacterLook';

/**
 * Where each look part lives in the character's 64x4 palette texture: the first texel column of its
 * 4-texel-wide swatch, found by sampling the model's UVs. Swatches cover the full texture height, and the
 * columns 4-15 (eyes, buckles, metal) are left alone. The original colours are the player's look.
 */
export const paletteSwatches: Readonly<Record<keyof CharacterLook, number>> = {
  hair: 0,
  skin: 16,
  clothA: 20,
  clothB: 24,
  clothC: 28,
  clothD: 32,
  clothE: 36,
  clothF: 40,
};
