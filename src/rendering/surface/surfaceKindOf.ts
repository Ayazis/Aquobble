import type { SurfaceKind } from './SurfaceKind';

const BY_NAME: readonly [RegExp, SurfaceKind | null][] = [
  [/metal|iron|steel/i, null],
  [/rock|stone/i, 'stone'],
  [/leaves|leaf|hay/i, 'foliage'],
  [/wood|brown|plank/i, 'wood'],
];

/** Guesses the surface kind from a model material's name; unnamed and palette materials count as plaster. */
export function surfaceKindOf(materialName: string): SurfaceKind | null {
  for (const [pattern, kind] of BY_NAME) if (pattern.test(materialName)) return kind;
  return 'plaster';
}

/** True for materials that should keep a metallic sheen. */
export function isMetal(materialName: string): boolean {
  return /metal|iron|steel/i.test(materialName);
}
