/**
 * Ground where grass cannot grow: a rectangle turned by `rotation` around +y, or a circle. `feather` (m)
 * overrides the width of the thinning band around this blocker.
 */
export type GrassBlocker = (
  | { kind: 'rect'; x: number; z: number; halfWidth: number; halfDepth: number; rotation: number }
  | { kind: 'circle'; x: number; z: number; radius: number }
) & { feather?: number };
