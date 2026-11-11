import type { SurfaceKind } from './SurfaceKind';
import { surfaceKindOfColour } from './surfaceKindOfColour';

const BY_NAME: readonly [RegExp, SurfaceKind | null][] = [
  [/metal|iron|steel/i, null],
  [/rock|stone/i, 'stone'],
  [/leaves|leaf|hay/i, 'foliage'],
  [/wood|brown|plank/i, 'wood'],
];

/**
 * Guesses the surface kind from a model material's name. Palette and unnamed materials are one colour
 * region each, so when their colour is known it decides (roof, door, footing, wall); otherwise plaster.
 */
export function surfaceKindOf(materialName: string, color?: number): SurfaceKind | null {
  for (const [pattern, kind] of BY_NAME) if (pattern.test(materialName)) return kind;
  return color === undefined ? 'plaster' : surfaceKindOfColour(color);
}

/** True for materials that should keep a metallic sheen. */
export function isMetal(materialName: string): boolean {
  return /metal|iron|steel/i.test(materialName);
}
