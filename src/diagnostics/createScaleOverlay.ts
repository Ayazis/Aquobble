import type { GameWorld, System } from '@core';
import type { PhysicsEngine } from '@physics';
import type * as THREE from 'three';
import { ScaleOverlayFactory } from './ScaleOverlayFactory';
import { ScaleOverlaySystem } from './ScaleOverlaySystem';

const PROBE_FROM = 500;

/** With `?debug&scale`: the scale overlay's frame system (run after the camera); otherwise nothing. */
export function createScaleOverlay(
  enabled: boolean,
  world: GameWorld,
  scene: THREE.Scene,
  camera: THREE.Camera,
  physics: PhysicsEngine,
): System[] {
  if (!enabled) return [];
  const groundHeight = (x: number, z: number): number | null => {
    const hit = physics.castRay({ x, y: PROBE_FROM, z }, { x: 0, y: -1, z: 0 }, PROBE_FROM * 2);
    return hit === null ? null : PROBE_FROM - hit;
  };
  return [new ScaleOverlaySystem(world, scene, camera, new ScaleOverlayFactory(), groundHeight)];
}
