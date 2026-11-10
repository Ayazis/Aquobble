import type { GameWorld, Random } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import { FractalNoise, TerrainGenerator, TerrainMeshFactory, TerrainSpawner, ValueNoise } from '@terrain';
import { RockMeshFactory, RockScatterFactory, RockScatterPlacer, RockScatterSpawner } from '@rocks';
import { ForestSpawner, TreeInstancesFactory, TreePlacer } from '@vegetation';
import { FlowerInstancesFactory, GrassInstancesFactory, GrassSpawner } from '@grass';
import type { GameConfig } from './GameConfig';
import { populateTown } from './populateTown';
import { populateWater } from './populateWater';

/** Creates the static world: terrain (levelled for the town, ponds carved), sea and ponds, town and forest. */
export function populateWorld(
  world: GameWorld,
  physics: PhysicsEngine,
  random: Random,
  config: GameConfig,
  townModels: ReadonlyMap<string, Object3D>,
  surfaces: SurfaceStyler,
): void {
  const noise = new FractalNoise(new ValueNoise(random));
  const terrain = new TerrainGenerator(noise, config.terrain).generate();
  const townArea = populateTown(world, physics, terrain, config.town, townModels, surfaces);

  const pondAreas = populateWater(world, terrain, random, config, [townArea]);
  new TerrainSpawner(world, physics, new TerrainMeshFactory()).spawn(terrain);
  const forest = { ...config.forest, exclude: [...(config.forest.exclude ?? []), townArea, ...pondAreas] };
  new ForestSpawner(world, new TreePlacer(terrain, random), new TreeInstancesFactory(surfaces), physics).spawn(forest);
  new GrassSpawner(world, terrain, random, new GrassInstancesFactory(), new FlowerInstancesFactory()).spawn(
    config.grass,
    config.waterLevel,
    [townArea, ...pondAreas],
  );
  const scatter = new RockScatterFactory(new RockMeshFactory(random, surfaces));
  new RockScatterSpawner(world, new RockScatterPlacer(terrain, random), scatter, physics).spawn({
    ...config.rockScatter,
    waterLevel: config.waterLevel,
    exclude: [...(config.rockScatter.exclude ?? []), townArea, ...pondAreas],
  });
}
