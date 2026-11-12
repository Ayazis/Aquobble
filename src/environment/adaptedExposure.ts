/** How far the exposure may open up for a dim sky, and how fully it makes up for the lost light (0..1). */
const MAX_GAIN = 14;
const ADAPTATION = 0.82;

/**
 * Camera exposure that adapts like an eye: a low sun lights the island a fraction as brightly as noon, so
 * the exposure opens up most (not all) of the way, leaving dusk a little moodier than midday. `night` (0..1)
 * hands over to the plain `base` exposure, because the night is lit by painted colours, not by the model.
 */
export function adaptedExposure(base: number, brightness: number, noonBrightness: number, night: number): number {
  const gain = Math.min(MAX_GAIN, Math.pow(noonBrightness / Math.max(brightness, 1e-4), ADAPTATION));
  const day = Math.max(1, gain);
  return base * (day + (1 - day) * Math.min(1, Math.max(0, night)));
}
