import type { GameWorld, Random } from '@core';
import { GridNavigator, NavGrid, type Navigator, type NavObstacle } from '@navigation';
import type { PhysicsEngine } from '@physics';
import { PlayerMeshFactory, type AnimatedModel } from '@player';
import { DEFAULT_TOWN_LAYOUT, type TownSite } from '@town';
import { TownsfolkModelFactory, TownsfolkSpawner } from '@townsfolk';

/** How many townsfolk walk the streets, and how fast. */
export interface TownsfolkConfig {
  minCount: number;
  maxCount: number;
  walkSpeed: number;
}

/** Side of a navigation cell (m): fine enough for the alleys between houses. */
const CELL = 0.25;
/** Distance walkers keep from walls and props: their capsule radius plus elbow room. */
const CLEARANCE = 0.5;

/**
 * Spawns the townsfolk (tinted clones of the character, capsules if it failed) on a navigation grid of
 * the ground inside the town wall, and returns the navigator they plan their walks with.
 */
export function spawnTownsfolk(
  world: GameWorld,
  physics: PhysicsEngine,
  random: Random,
  site: TownSite,
  obstacles: readonly NavObstacle[],
  config: TownsfolkConfig,
  model: AnimatedModel | null,
): Navigator {
  const half = DEFAULT_TOWN_LAYOUT.wall.halfSize;
  const ground = { minX: site.x - half, maxX: site.x + half, minZ: site.z - half, maxZ: site.z + half };
  const navigator = new GridNavigator(new NavGrid(ground, CELL, obstacles, CLEARANCE));
  const visuals = model ? new TownsfolkModelFactory(model, random) : new PlayerMeshFactory();
  const count = Math.floor(random.range(config.minCount, config.maxCount + 1));
  new TownsfolkSpawner(world, physics, visuals, random).spawn(count, navigator, config.walkSpeed);
  return navigator;
}
