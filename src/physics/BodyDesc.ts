import type { Quat, Vec3 } from '@core';
import type { ColliderShape } from './ColliderShape';

/** dynamic: simulated; fixed: never moves; kinematic: moved by code, pushes dynamic bodies. */
export type BodyKind = 'dynamic' | 'fixed' | 'kinematic';

/** Everything needed to create a rigid body with a single collider. */
export interface BodyDesc {
  kind: BodyKind;
  position: Vec3;
  rotation?: Quat;
  shape: ColliderShape;
  density?: number;
  friction?: number;
  restitution?: number;
}
