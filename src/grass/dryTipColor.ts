/** Linear-space colour of dry, yellowed grass tips. */
export const STRAW = [0.56, 0.42, 0.14];
/** Share of the tip colour the straw takes on the driest ground; a little green always shows through. */
export const MAX_DRY = 0.75;

/** The tip colour `tip` dried out by `dry` in [0, 1] (see `dryness`). */
export function dryTipColor(tip: readonly number[], dry: number): [number, number, number] {
  const k = dry * MAX_DRY;
  return [tip[0] + (STRAW[0] - tip[0]) * k, tip[1] + (STRAW[1] - tip[1]) * k, tip[2] + (STRAW[2] - tip[2]) * k];
}
