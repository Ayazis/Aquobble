import type * as THREE from 'three';
import { grassTuftGeometry } from './grassTuftGeometry';

/** Reeds: four broad grass blades stretched to about 1.3 m (12 triangles), stiff and upright. */
export function reedGeometry(): THREE.BufferGeometry {
  return grassTuftGeometry(4, 0.024).scale(1, 2.6, 1);
}
