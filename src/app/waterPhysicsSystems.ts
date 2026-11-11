import type { GameWorld, System } from '@core';
import type { PhysicsEngine } from '@physics';
import { BuoyancySystem, SinkingRockSystem, WaterPushSystem, type WaterLevel } from '@water';

/** lane C: water. Fixed systems between the movers and the physics step: rocks sink, wakes push, things float. */
export function waterPhysicsSystems(world: GameWorld, physics: PhysicsEngine, water: WaterLevel): System[] {
  return [new SinkingRockSystem(world), new WaterPushSystem(world, physics), new BuoyancySystem(world, physics, water)];
}
