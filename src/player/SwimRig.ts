import type * as THREE from 'three';

/** The player's procedural swim (2.14): extra actions on the same mixer and the model node it tilts. */
export interface SwimRig {
  kick: THREE.AnimationAction;
  stroke: THREE.AnimationAction;
  tread: THREE.AnimationAction;
  /** The model under `facing`, pitched forward and lowered while swimming. */
  body: THREE.Object3D;
  baseY: number;
  baseZ: number;
  /** Smoothed blend state: in deep water (0 wading .. 1 afloat), moving (0 treading .. 1 swimming), sink (m). */
  deep: number;
  moving: number;
  sink: number;
  time: number;
}
