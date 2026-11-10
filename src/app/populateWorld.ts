import type { GameWorld, Random } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import { FractalNoise, TerrainGenerator, TerrainMeshFactory, TerrainSpawner, ValueNoise } from '@terrain';
import { RockMeshFactory, RockScatterFactory, RockScatterPlacer, RockScatterSpawner } from '@rocks';
import { ForestSpawner, TreeInstancesFactory, TreePlacer } from '@vegetation';
import { FlowerInstancesFactory, GrassInstancesFactory, GrassSpawner } from '@grass';
import type { GameConfig } from './GameConfig';
import { populateTown, type TownGround } from './populateTown';
import { populateWater } from './populateWater';
import { pondCircle } from './pondCircle';

/** Creates the static world: terrain (levelled for the town, ponds carved), sea and ponds, town and forest. Returns the town's ground. */
export function populateWorld(
  world: GameWorld,
  physics: PhysicsEngine,
  random: Random,
  config: GameConfig,
  townModels: ReadonlyMap<string, Object3D>,
  surfaces: SurfaceStyler,
): TownGround {
  const noise = new FractalNoise(new ValueNoise(random));
  const terrain = new TerrainGenerator(noise, config.terrain).generate();
  const town = populateTown(world, physics, terrain, config.town, townModels, surfaces);
  const townArea = town.area;

  const pondAreas = populateWater(world, terrain, random, config, [townArea]);
  new TerrainSpawner(world, physics, new TerrainMeshFactory()).spawn(terrain);
  const forest = { ...config.forest, exclude: [...(config.forest.exclude ?? []), townArea, ...pondAreas] };
  new ForestSpawner(world, new TreePlacer(terrain, random), new TreeInstancesFactory(surfaces), physics).spawn(forest);
  new GrassSpawner(world, terrain, random, new GrassInstancesFactory(), new FlowerInstancesFactory()).spawn(
    config.grass,
    config.waterLevel,
    [],
    {
      blockers: [...town.grassBlockers, ...pondAreas.map(pondCircle)],
      feather: 1.5,
      lawns: [townArea],
    },
  );
  const scatter = new RockScatterFactory(new RockMeshFactory(random, surfaces));
  new RockScatterSpawner(world, new RockScatterPlacer(terrain, random), scatter, physics).spawn({
    ...config.rockScatter,
    waterLevel: config.waterLevel,
    exclude: [...(config.rockScatter.exclude ?? []), townArea, ...pondAreas],
  });
  return town;
}
