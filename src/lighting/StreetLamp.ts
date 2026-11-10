import type { Vec3 } from '@core';

/** Component: a street lamp that lights up at night. World-space points, fixed once the town stands. */
export interface StreetLamp {
  /** Centre of the lamp glass: where a real light sits when this lamp is among the nearest. */
  glass: Vec3;
  /** The point on the ground straight below the glass: centre of its pool of light. */
  ground: Vec3;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    streetLamp?: StreetLamp;
  }
}
