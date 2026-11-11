import * as THREE from 'three';
import type { GameWorld, Random } from '@core';
import type { GrassBlocker } from '@grass';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import {
  applyRockCover,
  RockScatterFactory,
  RockScatterPlacer,
  RockScatterSpawner,
  RockVariantFactory,
  type RockScatterSpawnOptions,
} from '@rocks';
import type { GroundShade, GroundShadeUniforms, HeightSampler } from '@terrain';

/** Rocks are wet up to this far (m) above the sea. */
const WET_ABOVE_WATER = 0.3;
/** Rocks smaller than this (scale, m) leave no contact patch: it would be under one texel of the map. */
const PATCH_MIN_SCALE = 0.45;

/** Share of a rock's size (radius, m) that grass keeps clear of; the rest of the rock stands in grass. */
const GRASS_FREE = 0.7;

/**
 * Spawns the decorative rocks (mossy in forest shade, wet at the shore) and records their contact patches.
 * Returns the ground they cover, for the grass to keep off.
 */
export function populateRocks(
  world: GameWorld,
  physics: PhysicsEngine,
  random: Random,
  terrain: HeightSampler,
  options: RockScatterSpawnOptions,
  surfaces: SurfaceStyler,
  shade: { map: GroundShade; uniforms: GroundShadeUniforms },
): GrassBlocker[] {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 });
  surfaces.apply(material, 'stone');
  applyRockCover(material, { wetLevel: options.waterLevel + WET_ABOVE_WATER, shade: shade.uniforms });
  const rocks = new RockScatterSpawner(
    world,
    new RockScatterPlacer(terrain, random),
    new RockVariantFactory(random),
    new RockScatterFactory(material),
    physics,
  ).spawn(options);
  for (const r of rocks) {
    if (r.scale >= PATCH_MIN_SCALE) shade.map.stamp(r.x, r.z, r.scale * 1.45, 0.7, 'contact');
  }
  // Grass stops short of the rock's middle and thins towards it, so tufts crowd its edge instead of poking through.
  return rocks
    .filter((r) => r.family !== 'pebbles' && r.scale >= PATCH_MIN_SCALE)
    .map((r) => ({ kind: 'circle', x: r.x, z: r.z, radius: r.scale * GRASS_FREE, feather: 0.3 + r.scale * 0.15 }));
}
