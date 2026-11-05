import { World } from 'miniplex';
import type { Entity } from './Entity';

/** The ECS world: the in-memory store of all entities. Query with `world.with('a', 'b')`. */
export type GameWorld = World<Entity>;

export function createGameWorld(): GameWorld {
  return new World<Entity>();
}
