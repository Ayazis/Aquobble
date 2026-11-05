/** Colour bands by height for the flat-shaded low-poly look. Ordered by `below`. */
export interface TerrainBand {
  below: number;
  color: number;
}

export const DEFAULT_PALETTE: readonly TerrainBand[] = [
  { below: 1, color: 0xd9c28a }, // sand
  { below: 6, color: 0x7aa35a }, // grass
  { below: 14, color: 0x4f7d45 }, // forest
  { below: 22, color: 0x8a7d6b }, // rock
  { below: Infinity, color: 0xf2f2f2 }, // snow
];

export function colorForHeight(height: number, palette: readonly TerrainBand[] = DEFAULT_PALETTE): number {
  return (palette.find((band) => height < band.below) ?? palette[palette.length - 1]).color;
}
