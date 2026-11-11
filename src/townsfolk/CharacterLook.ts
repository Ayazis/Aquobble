/**
 * One colour (0xRRGGBB) per recolourable swatch of the character palette texture. Parts are named after
 * where the swatch sits on the model; `clothA`..`clothF` are the separate garment pieces.
 */
export interface CharacterLook {
  hair: number;
  skin: number;
  clothA: number;
  clothB: number;
  clothC: number;
  clothD: number;
  clothE: number;
  clothF: number;
}
