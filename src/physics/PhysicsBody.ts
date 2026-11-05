import type { BodyHandle } from './BodyHandle';

/** Component: links an entity to a body in the physics engine. */
export interface PhysicsBody {
  handle: BodyHandle;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    physicsBody?: PhysicsBody;
  }
}
