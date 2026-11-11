import { SeededRandom, type GameWorld, type Random } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type { RenderQuality, SurfaceStyler } from '@rendering';
import {
  createGroundShadeUniforms,
  createHeightMapUniforms,
  FractalNoise,
  GroundShade,
  TerrainGenerator,
  TerrainMeshFactory,
  TerrainSpawner,
  ValueNoise,
} from '@terrain';
import {
  createGrassDensityUniforms,
  FlowerInstancesFactory,
  GrassFieldFactory,
  grassFurHook,
  GrassSpawner,
  TallTuftInstancesFactory,
} from '@grass';
import type { WindDirection } from '@wind';
import type { WaterLevel } from '@water';
import type { GameConfig } from './GameConfig';
import { populateForest } from './populateForest';
import { populateRocks } from './populateRocks';
import { populateTown, type TownGround } from './populateTown';
import { populateWater } from './populateWater';
import { pondCircle } from './pondCircle';
import { stampTownShade } from './stampTownShade';

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
  forestPack: Object3D | null = null,
  quality?: RenderQuality,
  wind: WindDirection = { x: 1, z: 0 }, // lane C: water
): TownGround & { water: WaterLevel } {
  const noise = new FractalNoise(new ValueNoise(random));
  const terrain = new TerrainGenerator(noise, config.terrain).generate();
  // Filled in as the town, trees and rocks are placed; the ground, roads and grass read it once drawing starts.
  const shade = new GroundShade(config.terrain.size, SHADE_RESOLUTION);
  const shadeUniforms = createGroundShadeUniforms(shade);
  // Puddles draw from their own stream, so they never move the rest of the world.
  const townGround = { shade: shadeUniforms, random: new SeededRandom(config.seed + 505) };
  const town = populateTown(world, physics, terrain, config.town, townModels, surfaces, townGround);
  stampTownShade(shade, town.obstacles);
  const townArea = town.area;

  const { areas: pondAreas, ponds, water } = populateWater(world, terrain, random, config, [townArea], physics, wind);
  // lane B: grass. Baked once the rocks are placed; the ground paints grass fur from it past the last band.
  const grassDensity = createGrassDensityUniforms();
  const hook = grassFurHook(grassDensity);
  // end lane B
  new TerrainSpawner(
    world,
    physics,
    new TerrainMeshFactory(undefined, undefined, shadeUniforms, config.waterLevel, hook),
  ).spawn(terrain);
  const forest = { ...config.forest, exclude: [...(config.forest.exclude ?? []), townArea, ...pondAreas] };
  populateForest(world, physics, random, terrain, forest, surfaces, shade, forestPack, townModels);
  const rocks = {
    ...config.rockScatter,
    waterLevel: config.waterLevel,
    ponds,
    exclude: [...(config.rockScatter.exclude ?? []), townArea, ...pondAreas],
  };
  const rockGround = populateRocks(world, physics, random, terrain, rocks, surfaces, {
    map: shade,
    uniforms: shadeUniforms,
  });
  // lane B: grass
  const field = new GrassFieldFactory(grassDensity, createHeightMapUniforms(terrain), shadeUniforms);
  const grass = [field, new FlowerInstancesFactory(), new TallTuftInstancesFactory(shadeUniforms)] as const;
  const grassQuality = { density: quality?.grassDensity ?? 1, midDistance: quality?.grassMidDistance ?? 45 };
  new GrassSpawner(world, terrain, random, grassDensity, ...grass).spawn(
    config.grass,
    config.waterLevel,
    grassQuality,
    [],
    {
      blockers: [...town.grassBlockers, ...pondAreas.map(pondCircle), ...rockGround],
      ponds: pondAreas.map(pondCircle),
      feather: 1.5,
      lawns: [townArea],
      canopyAt: (x, z) => shade.at(x, z, 'canopy'),
    },
  );
  // end lane B
  return { ...town, water };
}
