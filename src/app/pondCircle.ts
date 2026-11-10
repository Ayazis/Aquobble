import type { GrassBlocker } from '@grass';
import type { ExclusionZone } from '@vegetation';

/** The round pond inside its square footprint. */
export function pondCircle({ minX, maxX, minZ, maxZ }: ExclusionZone): GrassBlocker {
  return { kind: 'circle', x: (minX + maxX) / 2, z: (minZ + maxZ) / 2, radius: (maxX - minX) / 2 };
}
