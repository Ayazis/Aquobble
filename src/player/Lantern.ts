import type * as THREE from 'three';

/** Component: a hand lantern carried by a character. `on` is the switch; the rest is its presentation. */
export interface Lantern {
  on: boolean;
  /** Light strength when fully lit. */
  intensity: number;
  light: THREE.PointLight;
  /** The glowing lamp itself. */
  lamp: THREE.Object3D;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    lantern?: Lantern;
  }
}
