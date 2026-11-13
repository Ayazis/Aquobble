import { type GameWorld, type Random } from '@core';
import { createHeightMapUniforms, PondCarver, type HeightField, type Pond } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import type { PhysicsEngine } from '@physics';
import { HIGH_QUALITY, type RenderQuality } from '@rendering';
import type { WindDirection } from '@wind';
import {
  FloaterMeshFactory,
  FloaterSpawner,
  FoamTextureFactory,
  GerstnerWaveField,
  gerstnerWavesFromWind,
  SeaAndPonds,
  ShoreWaveField,
  Tide,
  waveShoaling,
  type WaveScale,
  WaterDetailFactory,
  WaterMeshFactory,
  WaterSpawner,
  type WaterLevel,
  type RippleUniforms, // lane C2
} from '@water';
import type { GameConfig } from './GameConfig';

/** What the rest of the game drives on the water: the sea state follows the wind (`SeaStateSystem`). */
export interface SeaControls {
  swell: { value: number };
  wind: { value: { z: number } };
}

/** The water of a populated world. */
export interface PopulatedWater {
  areas: ExclusionZone[];
  ponds: Pond[];
  water: WaterLevel;
  ripple: RippleUniforms;
  tide: Tide;
  sea: SeaControls;
}

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
  quality: RenderQuality = HIGH_QUALITY,
): PopulatedWater {
  const ponds = new PondCarver(random).carve(terrain, { ...config.ponds, avoid });
  // The generated textures draw from their own stream, so their size never moves the rest of the world.
  const texture = random.fork('water-detail');
  const detail = {
    detailMap: new WaterDetailFactory(texture).create(quality.water.detailMapSize),
    foamMap: new FoamTextureFactory(texture).create(),
    seaSegments: quality.water.seaSegments,
    fine: quality.water.fine,
    drawnLast: quality.refraction && quality.postEffects,
  };
  // lane C: water. Gerstner waves fanned around the prevailing wind; the CPU field and the shader share the numbers.
  const level = config.waterLevel;
  // Baked after the ponds are carved, so each water surface knows its own shoreline.
  const ground = createHeightMapUniforms(terrain);
  // Shoaling follows the tide and the sea state, as in the shader (only called once the meshes below exist).
  const stillDepth = (x: number, z: number) => level + tide.offset.value - terrain.heightAt(x, z);
  const shoal = (x: number, z: number): WaveScale => {
    const scale = waveShoaling(stillDepth(x, z), Math.hypot(x, z));
    return { kScale: scale.kScale, ampScale: scale.ampScale * meshes.swell.value };
  };
  const swell = new GerstnerWaveField(gerstnerWavesFromWind(wind), shoal);
  const field = new ShoreWaveField(swell, stillDepth, () => meshes.swell.value);
  const meshes = new WaterMeshFactory(detail, config.water, ground, undefined, swell.terms);
  meshes.wind.value.set(wind.x, wind.z, 0.5);
  const tide = new Tide(level, meshes.tide);
  const spawner = new WaterSpawner(world, meshes);
  spawner.spawn(config.waterLevel);
  for (const p of ponds) spawner.spawnPond(p.x, p.z, p.radius, p.level);
  // lane C: water. Floating driftwood and lily pads on their own stream (they replace the static pads).
  const water = new SeaAndPonds(terrain, level, field, meshes.time, ponds, meshes.tide);
  const floaters = new FloaterSpawner(world, physics, water, new FloaterMeshFactory(), random.fork('water'));
  floaters.driftwood(6, 140);
  floaters.lilyPads(ponds);
  const areas = ponds.map((p) => ({
    minX: p.x - p.radius,
    maxX: p.x + p.radius,
    minZ: p.z - p.radius,
    maxZ: p.z + p.radius,
  }));
  const sea = { swell: meshes.swell, wind: meshes.wind };
  return { areas, ponds, water, ripple: meshes.ripple, tide, sea }; // lane C2: ripple map
}
