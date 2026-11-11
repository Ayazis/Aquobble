import type { GameWorld, Random, System } from '@core';
import { RustleSpawner } from '@effects';
import { BendMap, GrassBendSystem, linkGrassWind, WindSwaySystem } from '@grass';
import type { RenderQuality } from '@rendering';
import type { InstalledWind } from './installWind';
import type * as THREE from 'three';

/** Side of the bend map's box round the player (m). */
const BEND_BOX = 32;

/**
 * Lane B2: grass physics. Points every plant at the shared wind and the trampling bend map, and returns the
 * frame systems (bend map step, rustle motes) to run before the render. Call after the world is populated.
 */
export function installGrassPhysics(
  world: GameWorld,
  renderer: THREE.WebGLRenderer,
  quality: RenderQuality,
  wind: InstalledWind,
  random: Random,
  bendRadius: number,
): System[] {
  const bendMap = new BendMap(renderer, quality.grassBendMapSize, BEND_BOX);
  linkGrassWind(world, wind.uniforms, bendMap.uniforms);
  const rustle = new RustleSpawner(world, random.fork('rustle'), wind.wind).spawn();
  return [new WindSwaySystem(world), new GrassBendSystem(world, bendMap, bendRadius), rustle];
}
