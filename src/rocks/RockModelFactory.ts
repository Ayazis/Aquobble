import type * as THREE from 'three';

export interface RockModel {
  mesh: THREE.Mesh;
  /** Vertex positions, used as the convex-hull collider so physics matches the visual shape. */
  hullPoints: Float32Array;
}

/** Builds the visual + collider shape for one falling rock of a given radius. */
export interface RockModelFactory {
  create(radius: number): RockModel;
}
