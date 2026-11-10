import * as THREE from 'three';
import type { Lantern } from './Lantern';

const WARM = 0xffb45e;
/** Where the light sits on the carrier (feet at the origin, +z ahead): knee height, a step in front. */
const LIGHT_POSITION = { x: 0.25, y: 0.75, z: 0.85 };
/** How fast the light falls off with distance; below 2 (physical) so the pool reaches a few metres. */
const DECAY = 1.6;

/**
 * Builds a hand lantern: a small glowing lamp at hip height on the right of `carrier`, and a warm point
 * light held low and ahead of it, so it lights the ground around the character and stays far enough from
 * the head and torso not to bleach them. It casts no shadows (a point light's shadow is six extra scene
 * passes) and starts switched off. The light stays in the scene at zero strength when off, because adding
 * or removing a light makes three.js recompile every lit shader.
 */
export class LanternFactory {
  constructor(
    private readonly intensity = 4,
    private readonly reach = 9,
  ) {}

  create(carrier: THREE.Object3D): Lantern {
    const light = new THREE.PointLight(WARM, 0, this.reach, DECAY);
    light.position.set(LIGHT_POSITION.x, LIGHT_POSITION.y, LIGHT_POSITION.z);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffd9a0, fog: false }),
    );
    lamp.position.set(0.42, 0.95, 0.3);
    lamp.visible = false;
    carrier.add(light, lamp);
    return { on: false, intensity: this.intensity, light, lamp };
  }
}
