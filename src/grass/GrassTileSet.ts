import type * as THREE from 'three';
import type { GrassBand } from './GrassBand';

/** The tiles one band of the grass field draws this frame; `GrassTileSystem` rewrites it as the camera moves. */
export interface GrassTileSet {
  band: GrassBand;
  /** World xz of the low corner of each drawn tile (two numbers per tile), nearest tiles first. */
  origins: Float32Array;
  /** The instanced attribute over `origins`, flagged for upload when the tiles change. */
  attribute: THREE.InstancedBufferAttribute;
  /** The band's geometry: its `instanceCount` is the number of blades drawn. */
  geometry: THREE.InstancedBufferGeometry;
}
