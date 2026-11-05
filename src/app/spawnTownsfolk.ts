import type { GameWorld, Random } from '@core';
import type { PhysicsEngine } from '@physics';
import { PlayerMeshFactory, type AnimatedModel } from '@player';
import { DEFAULT_TOWN_LAYOUT, type TownSite } from '@town';
import { TownsfolkModelFactory, TownsfolkSpawner, type WanderArea } from '@townsfolk';

/** How many townsfolk walk the streets, and how fast. */
export interface TownsfolkConfig {
  minCount: number;
  maxCount: number;
  walkSpeed: number;
}

/** Margin kept inside the town wall so targets are not picked on the wall itself. */
const WALL_MARGIN = 4;

/** Spawns the townsfolk (tinted clones of the character, capsules if it failed) and returns their wander area. */
export function spawnTownsfolk(
  world: GameWorld,
  physics: PhysicsEngine,
  random: Random,
  site: TownSite,
  config: TownsfolkConfig,
  model: AnimatedModel | null,
): WanderArea {
  const area = { x: site.x, z: site.z, radius: DEFAULT_TOWN_LAYOUT.size / 2 - WALL_MARGIN };
  const visuals = model ? new TownsfolkModelFactory(model, random) : new PlayerMeshFactory();
  const count = Math.floor(random.range(config.minCount, config.maxCount + 1));
  new TownsfolkSpawner(world, physics, visuals, random).spawn(count, area, config.walkSpeed);
  return area;
}
