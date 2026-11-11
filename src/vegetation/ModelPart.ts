import type * as THREE from 'three';

/**
 * One drawable piece of a forest model (bark, leaves, or a whole untextured log), with its geometry in
 * model space (metres, standing on y = 0). `leaves` parts sway and get the crown rim.
 */
export interface ModelPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  role: 'leaves' | 'wood';
}
