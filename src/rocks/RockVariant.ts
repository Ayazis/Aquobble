import type * as THREE from 'three';
import type { RockFamily } from './RockFamily';

/** One rock shape at unit size, shared by every rock that uses it. */
export interface RockVariant {
  geometry: THREE.BufferGeometry;
  /** Its distinct vertex positions (x, y, z triples), for a convex-hull collider. */
  hull: Float32Array;
}

/** The shapes to pick from, by family. */
export type RockVariantSet = Record<RockFamily, RockVariant[]>;
