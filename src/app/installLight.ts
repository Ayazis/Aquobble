import type { GameWorld, System, Vec3 } from '@core';
import { bakeStreetProbes, type StreetLamp } from '@lighting';
import type { PhysicsEngine } from '@physics';
import type {} from '@player';
import { bakeVertexAo, MAX_TOON_PROBES, ToonLightSystem, type RenderQuality } from '@rendering';
import { colorForHeight } from '@terrain';
import type { BufferGeometry, Object3D } from 'three';
import type { InstalledEnvironment } from './installEnvironment';

/** Packed earth and paving inside the town walls: the warm bounce under the player on the roads. */
const TOWN_GROUND = 0xb09470;

interface Area {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Lane D: light. Bakes the street light probes (call once the lamps stand) and returns the frame system for
 * shadow tint and bounce light. Run the system after the day/night system.
 */
export function installLight(world: GameWorld, physics: PhysicsEngine, env: InstalledEnvironment, town: Area): System {
  const lamps: StreetLamp[] = [...world.with('streetLamp')].map((entity) => entity.streetLamp);
  const castRay = (origin: Vec3, direction: Vec3, max: number) => physics.castRay(origin, direction, max);
  env.lighting.light.setProbes(bakeStreetProbes(lamps, castRay, MAX_TOON_PROBES));

  const players = world.with('player', 'transform');
  const inTown = (p: Vec3) => p.x > town.minX && p.x < town.maxX && p.z > town.minZ && p.z < town.maxZ;
  const groundAt = (p: Vec3) => (inTown(p) ? TOWN_GROUND : colorForHeight(p.y));
  const night = () => env.dayNight.nightAmount;
  return new ToonLightSystem(env.lighting.light, env.fill, night, () => players.first?.transform.position, groundAt);
}

/** Phones: bake vertex AO into the template models before they are placed (clones share the geometry). */
export function bakeModelAo(quality: RenderQuality, models: Iterable<Object3D | null | undefined>): void {
  if (!quality.vertexAo) return;
  const done = new Set<BufferGeometry>();
  for (const model of models) if (model) bakeVertexAo(model, done);
}
