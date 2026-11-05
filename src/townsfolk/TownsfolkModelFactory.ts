import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Random } from '@core';
import { PlayerModelFactory, type AnimatedModel, type PlayerVisualFactory } from '@player';

/**
 * Builds townsfolk visuals from the player's rigged character: each one an independent skinned clone
 * with its materials tinted a little differently, so a crowd does not look like copies.
 */
export class TownsfolkModelFactory implements PlayerVisualFactory {
  constructor(
    private readonly model: AnimatedModel,
    private readonly random: Random,
    private readonly height = 1.75,
  ) {}

  create(halfHeight: number, radius: number) {
    const scene = clone(this.model.scene);
    // The player factory may already have scaled the shared source; start from a clean root.
    scene.scale.setScalar(1);
    scene.position.set(0, 0, 0);
    const tint = new THREE.Color().setHSL(this.random.next(), 0.35, 0.75);
    const tinted = (material: THREE.Material) => {
      const copy = material.clone();
      if ('color' in copy && copy.color instanceof THREE.Color) copy.color.multiply(tint);
      return copy;
    };
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.material = Array.isArray(o.material) ? o.material.map(tinted) : tinted(o.material);
    });
    const height = this.height * this.random.range(0.92, 1.05);
    return new PlayerModelFactory({ scene, animations: this.model.animations }, height).create(halfHeight, radius);
  }
}
