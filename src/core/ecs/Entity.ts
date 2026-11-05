import type { Transform } from './Transform';

/**
 * The shape of every entity in the world: a bag of optional components.
 *
 * Core only declares the components it owns. Each slice adds its own components through module
 * augmentation, so core never depends on a slice:
 *
 *   declare module '@core/ecs/Entity' { interface Entity { physicsBody?: PhysicsBody } }
 *
 * (Augment this file's path, not '@core': TypeScript only merges into the declaring module.)
 */
export interface Entity {
  transform?: Transform;
}
