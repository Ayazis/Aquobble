import { COLOUR_SCRIPT } from '@rendering'; // lane E: palette

/** Colour bands by height for the flat-shaded low-poly look. Ordered by `below`. */
export interface TerrainBand {
  below: number;
  color: number;
}

export const DEFAULT_PALETTE: readonly TerrainBand[] = [
  { below: 1, color: COLOUR_SCRIPT.biomes.sand }, // sand
  { below: 6, color: COLOUR_SCRIPT.biomes.meadow }, // grass
  { below: 14, color: COLOUR_SCRIPT.biomes.forest }, // forest
  { below: 22, color: COLOUR_SCRIPT.biomes.rock }, // rock
  { below: Infinity, color: COLOUR_SCRIPT.biomes.snow }, // snow
];

export function colorForHeight(height: number, palette: readonly TerrainBand[] = DEFAULT_PALETTE): number {
  return (palette.find((band) => height < band.below) ?? palette[palette.length - 1]).color;
}
