import { COLOUR_SCRIPT } from '@rendering'; // lane E: palette

/**
 * Tip colour as a per-channel multiple of the ground colour, for tint 0 (cool, deeper green) and tint 1
 * (warm, yellower). Their average has about the ground's brightness, so a field of grass keeps the colour of
 * the bare ground beyond it; the warm end stays just under the brightest tip the grass had before.
 */
export const COOL_TIP_GAIN = COLOUR_SCRIPT.grassTips.cool; // lane E: palette
export const WARM_TIP_GAIN = COLOUR_SCRIPT.grassTips.warm; // lane E: palette

/** Linear-space blade tip colour for a tuft on ground of the given linear colour; `tint` in [0, 1). */
export function grassTipColor(ground: readonly number[], tint: number): [number, number, number] {
  const gain = (i: number) => COOL_TIP_GAIN[i] + (WARM_TIP_GAIN[i] - COOL_TIP_GAIN[i]) * tint;
  return [ground[0] * gain(0), ground[1] * gain(1), ground[2] * gain(2)];
}
