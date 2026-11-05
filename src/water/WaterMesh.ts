import type { Object3D } from 'three';
import type { WaterSurface } from './WaterSurface';

/** A built water object plus the uniform that animates it. */
export interface WaterMesh {
  object: Object3D;
  surface: WaterSurface;
}
