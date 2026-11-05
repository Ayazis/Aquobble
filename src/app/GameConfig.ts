import { DEFAULT_ENVIRONMENT, type EnvironmentConfig } from '@environment';
import type { RockRecycleOptions } from '@rocks';
import { DEFAULT_TERRAIN, type TerrainConfig } from '@terrain';
import type { TownSite } from '@town';
import type { TreePlacerOptions } from '@vegetation';

/** All tunable numbers in one place. */
export interface GameConfig {
  seed: number;
  waterLevel: number;
  terrain: TerrainConfig;
  environment: EnvironmentConfig;
  forest: TreePlacerOptions;
  rocks: RockRecycleOptions;
  /** Rain of falling rocks/cookies (the physics demo). Off now that the island hosts a town. */
  fallingRocks: boolean;
  town: TownSite;
  /** Optional model for the falling rocks (path under public/), e.g. "assets/models/cookie.glb". Procedural rocks if unset. */
  rockModel?: string;
}

export const DEFAULT_CONFIG: GameConfig = {
  seed: 1337,
  waterLevel: 0.2,
  terrain: DEFAULT_TERRAIN,
  environment: DEFAULT_ENVIRONMENT,
  forest: { count: 220, extent: 80, minHeight: 2, maxHeight: 11 },
  rocks: { population: 40, removeBelow: -2, dropExtent: 50, dropHeight: 40 },
  fallingRocks: false,
  town: { x: 0, z: 0, blend: 14, minLevel: 3 },
  rockModel: 'assets/models/cookie.glb',
};
