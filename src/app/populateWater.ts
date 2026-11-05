import * as THREE from 'three';
import { vec3, type GameWorld, type Random } from '@core';
import { PondCarver, type HeightField } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import { WaterMeshFactory, WaterNormalsFactory, WaterSpawner } from '@water';
import type { GameConfig } from './GameConfig';

/**
 * Carves the ponds (must run before the terrain mesh and collider are built) and spawns the sea
 * and a water surface per pond. Returns each pond's footprint so vegetation can keep clear.
 */
export function populateWater(
  world: GameWorld,
  terrain: HeightField,
  random: Random,
  config: GameConfig,
  avoid: readonly ExclusionZone[],
): ExclusionZone[] {
  const ponds = new PondCarver(random).carve(terrain, { ...config.ponds, avoid });
  const { environment, water } = config;
  // Noon sun; WaterSurface.sunDirection can be updated per frame once the day cycle exposes the sun.
  const elevation = THREE.MathUtils.degToRad(environment.noonSunElevation);
  const azimuth = THREE.MathUtils.degToRad(environment.sunAzimuth);
  const sunDirection = vec3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  );
  const normals = new WaterNormalsFactory(random).create();
  const meshes = new WaterMeshFactory(normals, { ...water, sunDirection });
  const spawner = new WaterSpawner(world, meshes);
  spawner.spawn(config.waterLevel);
  for (const p of ponds) spawner.spawnPond(p.x, p.z, p.radius, p.level);
  return ponds.map((p) => ({ minX: p.x - p.radius, maxX: p.x + p.radius, minZ: p.z - p.radius, maxZ: p.z + p.radius }));
}
