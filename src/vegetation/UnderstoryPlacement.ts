import type { UnderstoryKind } from './UnderstoryKind';

/** One bush, fern, mushroom, log or stump. Pure data, produced by ForestFloorPlacer and EdgeBushPlacer. */
export interface UnderstoryPlacement {
  kind: UnderstoryKind;
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
  /** 0..1, varies the colour a little. */
  tint: number;
}
