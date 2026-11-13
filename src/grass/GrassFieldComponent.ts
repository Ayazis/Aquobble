import type { GrassCoverage } from './GrassCoverage';
import type { GrassTileSet } from './GrassTileSet';

/**
 * Marks the grass field entity. `keep` is the share of blades drawn (lowered by `GrassWatchdogSystem`);
 * `tiles` and `coverage` are what `GrassTileSystem` needs to pick the tiles in view each frame.
 */
export interface GrassFieldComponent {
  keep: { value: number };
  tiles: readonly GrassTileSet[];
  coverage: GrassCoverage;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    grassField?: GrassFieldComponent;
  }
}
