/** Colour bands by height for the flat-shaded low-poly look. Ordered by `below`. */
export interface TerrainBand {
  below: number;
  color: number;
}

export const DEFAULT_PALETTE: readonly TerrainBand[] = [
  { below: 1, color: 0xead9a0 }, // sand
  { below: 6, color: 0x7fc24a }, // grass
  { below: 14, color: 0x4f9a3c }, // forest
  { below: 22, color: 0x9a8f80 }, // rock
  { below: Infinity, color: 0xf2f2f2 }, // snow
];

export function colorForHeight(height: number, palette: readonly TerrainBand[] = DEFAULT_PALETTE): number {
  return (palette.find((band) => height < band.below) ?? palette[palette.length - 1]).color;
}
