import { SeededRandom, type GameWorld, type Random } from '@core';
import { createHeightMapUniforms, PondCarver, type HeightField, type Pond } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import { LilyPadFactory, WaterMeshFactory, WaterNormalsFactory, WaterSpawner } from '@water';
import type { GameConfig } from './GameConfig';

/**
 * Carves the ponds (must run before the terrain mesh and collider are built) and spawns the sea
 * and a water surface per pond. Returns the ponds and each one's footprint, so vegetation can keep clear.
 */
export function populateWater(
  world: GameWorld,
  terrain: HeightField,
  random: Random,
  config: GameConfig,
  avoid: readonly ExclusionZone[],
): { areas: ExclusionZone[]; ponds: Pond[] } {
  const ponds = new PondCarver(random).carve(terrain, { ...config.ponds, avoid });
  const normals = new WaterNormalsFactory(random).create();
  // Decoration draws from its own stream, so adding or changing it never moves the rest of the world.
  const pads = new SeededRandom(config.seed + 1);
  // Baked after the ponds are carved, so each water surface knows its own shoreline.
  const ground = createHeightMapUniforms(terrain);
  const meshes = new WaterMeshFactory(normals, config.water, ground, new LilyPadFactory(pads));
  const spawner = new WaterSpawner(world, meshes);
  spawner.spawn(config.waterLevel);
  for (const p of ponds) spawner.spawnPond(p.x, p.z, p.radius, p.level);
  const areas = ponds.map((p) => ({
    minX: p.x - p.radius,
    maxX: p.x + p.radius,
    minZ: p.z - p.radius,
    maxZ: p.z + p.radius,
  }));
  return { areas, ponds };
}
