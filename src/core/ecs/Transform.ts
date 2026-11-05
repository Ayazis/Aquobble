import type { Quat } from '../math/Quat';
import type { Vec3 } from '../math/Vec3';

/** World-space pose of an entity. Plain data: simulation writes it, presentation reads it. */
export interface Transform {
  position: Vec3;
  rotation: Quat;
}
