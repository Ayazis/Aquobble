import * as THREE from 'three';
import type { Lantern } from './Lantern';

const WARM = 0xffb45e;

/**
 * Builds a hand lantern: a small glowing lamp and a warm point light, hung on `carrier` at hip height on
 * the right. It casts no shadows (a point light's shadow is six extra scene passes) and starts switched
 * off. The light stays in the scene at zero strength when off, because adding or removing a light makes
 * three.js recompile every lit shader.
 */
export class LanternFactory {
  constructor(
    private readonly intensity = 14,
    private readonly reach = 16,
  ) {}

  create(carrier: THREE.Object3D): Lantern {
    const light = new THREE.PointLight(WARM, 0, this.reach, 1.6);
    light.position.set(0.45, 1.25, 0.35);
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
