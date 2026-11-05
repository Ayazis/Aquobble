import type { GameWorld, Random } from '@core';
import type { PhysicsEngine } from '@physics';
import { FractalNoise, TerrainGenerator, TerrainMeshFactory, TerrainSpawner, ValueNoise } from '@terrain';
import { ForestSpawner, TreeInstancesFactory, TreePlacer } from '@vegetation';
import { WaterMeshFactory, WaterSpawner } from '@water';
import type { GameConfig } from './GameConfig';
import { populateTown } from './populateTown';

/** Creates the static world: terrain (levelled for the town), sea, town and forest. */
export function populateWorld(world: GameWorld, physics: PhysicsEngine, random: Random, config: GameConfig): void {
  const noise = new FractalNoise(new ValueNoise(random));
  const terrain = new TerrainGenerator(noise, config.terrain).generate();
  const townArea = populateTown(world, physics, terrain, config.town);

  new TerrainSpawner(world, physics, new TerrainMeshFactory()).spawn(terrain);
  new WaterSpawner(world, new WaterMeshFactory()).spawn(config.waterLevel);
  const forest = { ...config.forest, exclude: [...(config.forest.exclude ?? []), townArea] };
  new ForestSpawner(world, new TreePlacer(terrain, random), new TreeInstancesFactory()).spawn(forest);
}
