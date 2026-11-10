import { LUSH_BAND } from './LushBand';
import { DEFAULT_PALETTE } from './TerrainPalette';
import { linearRgb } from './linearRgb';

const GRASS = linearRgb(DEFAULT_PALETTE[1].color);
const FOREST = linearRgb(DEFAULT_PALETTE[2].color);

/**
 * Linear-space colour of the ground where plants grow, at a world height: the terrain shader's base colour
 * in its grass band, before detail textures and without the noise that makes its band edge ragged.
 */
export function lushGroundColor(height: number): [number, number, number] {
  const x = Math.min(Math.max((height - LUSH_BAND.start) / (LUSH_BAND.end - LUSH_BAND.start), 0), 1);
  const k = x * x * (3 - 2 * x);
  return [0, 1, 2].map((i) => GRASS[i] + (FOREST[i] - GRASS[i]) * k) as [number, number, number];
}
