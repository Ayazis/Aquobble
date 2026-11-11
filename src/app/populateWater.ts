import { type GameWorld, type Random } from '@core';
import { createHeightMapUniforms, PondCarver, type HeightField, type Pond } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import type { PhysicsEngine } from '@physics';
import type { WindDirection } from '@wind';
import {
  FloaterMeshFactory,
  FloaterSpawner,
  GerstnerWaveField,
  gerstnerWavesFromWind,
  SeaAndPonds,
  waveShoaling,
  WaterMeshFactory,
  WaterNormalsFactory,
  WaterSpawner,
  type WaterLevel,
  type RippleUniforms, // lane C2
} from '@water';
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
  // lane C: water
  physics: PhysicsEngine,
  wind: WindDirection,
): { areas: ExclusionZone[]; ponds: Pond[]; water: WaterLevel; ripple: RippleUniforms } {
  const ponds = new PondCarver(random).carve(terrain, { ...config.ponds, avoid });
  const normals = new WaterNormalsFactory(random).create();
  // lane C: water. Gerstner waves fanned around the prevailing wind; the CPU field and the shader share the numbers.
  const level = config.waterLevel;
  const shoal = (x: number, z: number) => waveShoaling(level - terrain.heightAt(x, z), Math.hypot(x, z));
  const field = new GerstnerWaveField(gerstnerWavesFromWind(wind), shoal);
  // Baked after the ponds are carved, so each water surface knows its own shoreline.
  const ground = createHeightMapUniforms(terrain);
  const meshes = new WaterMeshFactory(normals, config.water, ground, undefined, field.terms);
  const spawner = new WaterSpawner(world, meshes);
  spawner.spawn(config.waterLevel);
  for (const p of ponds) spawner.spawnPond(p.x, p.z, p.radius, p.level);
  // lane C: water. Floating driftwood and lily pads on their own stream (they replace the static pads).
  const water = new SeaAndPonds(terrain, level, field, meshes.time, ponds);
  const floaters = new FloaterSpawner(world, physics, water, new FloaterMeshFactory(), random.fork('water'));
  floaters.driftwood(6, 140);
  floaters.lilyPads(ponds);
  const areas = ponds.map((p) => ({
    minX: p.x - p.radius,
    maxX: p.x + p.radius,
    minZ: p.z - p.radius,
    maxZ: p.z + p.radius,
  }));
  return { areas, ponds, water, ripple: meshes.ripple }; // lane C2: ripple map
}
