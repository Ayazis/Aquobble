import type * as THREE from 'three';
import type { SurfaceKind } from './SurfaceKind';

/** Gives a material the shared look of its surface kind. Only for objects that never move (detail is in world space). */
export interface SurfaceStyler {
  apply(material: THREE.Material, kind: SurfaceKind): void;
  /** Optional: grain per colour region of a palette-textured material. */
  applyPalette?(material: THREE.Material): void;
}
