import type { GameWorld, Random } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import {
  createGroundShadeUniforms,
  FractalNoise,
  GroundShade,
  TerrainGenerator,
  TerrainMeshFactory,
  TerrainSpawner,
  ValueNoise,
} from '@terrain';
import { FlowerInstancesFactory, GrassInstancesFactory, GrassSpawner } from '@grass';
import type { GameConfig } from './GameConfig';
import { populateForest } from './populateForest';
import { populateRocks } from './populateRocks';
import { populateTown, type TownGround } from './populateTown';
import { populateWater } from './populateWater';
import { pondCircle } from './pondCircle';

/** Texels per side of the ground shade map: about 20 cm each on the default island. */
const SHADE_RESOLUTION = 1024;

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
  // Filled in as trees and rocks are placed; the ground and the grass read it once drawing starts.
  const shade = new GroundShade(config.terrain.size, SHADE_RESOLUTION);
  const shadeUniforms = createGroundShadeUniforms(shade);
  new TerrainSpawner(world, physics, new TerrainMeshFactory(undefined, undefined, shadeUniforms)).spawn(terrain);
  const forest = { ...config.forest, exclude: [...(config.forest.exclude ?? []), townArea, ...pondAreas] };
  populateForest(world, physics, random, terrain, forest, surfaces, shade);
  const rocks = {
    ...config.rockScatter,
    waterLevel: config.waterLevel,
    exclude: [...(config.rockScatter.exclude ?? []), townArea, ...pondAreas],
  };
  const rockGround = populateRocks(world, physics, random, terrain, rocks, surfaces, {
    map: shade,
    uniforms: shadeUniforms,
  });
  const grass = new GrassInstancesFactory(shadeUniforms);
  new GrassSpawner(world, terrain, random, grass, new FlowerInstancesFactory()).spawn(
    config.grass,
    config.waterLevel,
    [],
    {
      blockers: [...town.grassBlockers, ...pondAreas.map(pondCircle), ...rockGround],
      feather: 1.5,
      lawns: [townArea],
    },
  );
  return town;
}
