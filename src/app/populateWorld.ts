import type { GameWorld, Random } from '@core';
import type { PhysicsEngine } from '@physics';
import { FractalNoise, TerrainGenerator, TerrainMeshFactory, TerrainSpawner, ValueNoise } from '@terrain';
import { ForestSpawner, TreeInstancesFactory, TreePlacer } from '@vegetation';
import { WaterMeshFactory, WaterSpawner } from '@water';
import type { GameConfig } from './GameConfig';

/** Creates the static world: terrain, sea and forest. */
export function populateWorld(world: GameWorld, physics: PhysicsEngine, random: Random, config: GameConfig): void {
  const noise = new FractalNoise(new ValueNoise(random));
  const terrain = new TerrainGenerator(noise, config.terrain).generate();

  new TerrainSpawner(world, physics, new TerrainMeshFactory()).spawn(terrain);
  new WaterSpawner(world, new WaterMeshFactory()).spawn(config.waterLevel);
  const placer = new TreePlacer(terrain, random);
  new ForestSpawner(world, placer, new TreeInstancesFactory(), physics).spawn(config.forest);
}
