import { DEFAULT_ENVIRONMENT, type EnvironmentConfig } from '@environment';
import type { GrassOptions } from '@grass';
import type { RockRecycleOptions, RockScatterSpawnOptions } from '@rocks';
import { DEFAULT_TERRAIN, type PondOptions, type TerrainConfig } from '@terrain';
import type { TownSite } from '@town';
import type { TreePlacerOptions } from '@vegetation';
import type { WaterLook } from '@water';
import type { TownsfolkConfig } from './spawnTownsfolk';

/** All tunable numbers in one place. */
export interface GameConfig {
  seed: number;
  waterLevel: number;
  /** Shading of sea and ponds. */
  water: WaterLook;
  /** Seeded hollows with their own water; the town area is avoided automatically. */
  ponds: Omit<PondOptions, 'avoid'>;
  terrain: TerrainConfig;
  environment: EnvironmentConfig;
  forest: TreePlacerOptions;
  /** Instanced grass blades and flower clusters; skips beaches, steep slopes, town and ponds. */
  grass: GrassOptions;
  rocks: RockRecycleOptions;
  /** Static decorative rocks; the water level comes from `waterLevel`. */
  rockScatter: Omit<RockScatterSpawnOptions, 'waterLevel'>;
  /** Rain of falling rocks/cookies (the physics demo). Off now that the island hosts a town. */
  fallingRocks: boolean;
  town: TownSite;
  townsfolk: TownsfolkConfig;
  /** Optional model for the falling rocks (path under public/), e.g. "assets/models/cookie.glb". Procedural rocks if unset. */
  rockModel?: string;
}

export const DEFAULT_CONFIG: GameConfig = {
  seed: 1337,
  waterLevel: 0.2,
  water: { waterColor: 0x1fa3c4, opacity: 0.8 },
  ponds: { count: 3, extent: 60, minRadius: 3.5, maxRadius: 6.5, depth: 1.6, minLevel: 1.2, freeboard: 0.25 },
  terrain: DEFAULT_TERRAIN,
  environment: DEFAULT_ENVIRONMENT,
  forest: { count: 340, extent: 80, minHeight: 2, maxHeight: 11 },
  grass: {
    grass: { count: 110000, extent: 80 },
    flowers: { clusters: 130, perCluster: 14, radius: 2.5, variants: 5, extent: 80 },
    beachMargin: 0.8,
    maxHeight: 14,
    maxSlope: 0.7,
  },
  rocks: { population: 40, removeBelow: -2, dropExtent: 50, dropHeight: 40 },
  rockScatter: {
    clusters: 95,
    clusterSize: 5,
    extent: 85,
    maxHeight: 30,
    minScale: 0.25,
    maxScale: 2.2,
    variants: 6,
    colliderMinScale: 0.9,
  },
  fallingRocks: false,
  town: { x: 0, z: 0, blend: 14, minLevel: 3 },
  townsfolk: { minCount: 10, maxCount: 16, walkSpeed: 1.4 },
  rockModel: 'assets/models/cookie.glb',
};
