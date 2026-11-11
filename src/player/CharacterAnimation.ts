import type * as THREE from 'three';
import type { SwimRig } from './SwimRig';

/** Locomotion clips a character can play. */
export type LocomotionClip = 'idle' | 'walk' | 'run';

/** Component (presentation): a skinned character's mixer, its locomotion actions and the node turned to face. */
export interface CharacterAnimation {
  mixer: THREE.AnimationMixer;
  actions: Record<LocomotionClip, THREE.AnimationAction>;
  current: LocomotionClip;
  /** Child of the render object rotated around +y to face the movement direction. */
  facing: THREE.Object3D;
  /** Player only: the procedural swim. Villagers never swim. */
  swim?: SwimRig;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    characterAnimation?: CharacterAnimation;
  }
}
