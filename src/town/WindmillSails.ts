import type { Object3D } from 'three';

/** Component: a windmill's sails, turned about their local y axis by `SailSystem`. */
export interface WindmillSails {
  object: Object3D;
  /** Current angle (radians). */
  angle: number;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    windmillSails?: WindmillSails;
  }
}
