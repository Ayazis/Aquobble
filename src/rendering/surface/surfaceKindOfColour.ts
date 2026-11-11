import type { SurfaceKind } from './SurfaceKind';

/**
 * Guesses what a building palette colour is made of, so one palette material per colour region gets its own
 * grain: warm saturated reds and slate blues are roof tiles (masonry), browns are doors and timber (wood),
 * neutral greys are footings and stone (stone), and light or pale colours stay plaster walls.
 */
export function surfaceKindOfColour(hex: number): SurfaceKind {
  const r = ((hex >> 16) & 0xff) / 255;
  const g = ((hex >> 8) & 0xff) / 255;
  const b = (hex & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  if (saturation < 0.15) return max > 0.72 ? 'plaster' : 'stone';
  const roofRed = r === max && r - g > 0.18 && saturation > 0.4;
  const slate = b === max && saturation > 0.2 && max < 0.7;
  if (roofRed || slate) return 'masonry';
  const brown = r >= g && g >= b && max < 0.62;
  return brown ? 'wood' : 'plaster';
}
