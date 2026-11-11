import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Random } from '@core';
import { PlayerModelFactory, type AnimatedModel, type PlayerVisualFactory } from '@player';
import { PaletteReskinner } from './PaletteReskinner';
import { pickLook } from './pickLook';

/**
 * Builds townsfolk visuals from the player's rigged character: each one an independent skinned clone
 * whose palette texture has its hair, skin and clothes swatches repainted with a random look. The player
 * keeps the original palette, whose colours no villager look uses.
 */
export class TownsfolkModelFactory implements PlayerVisualFactory {
  private readonly reskinners = new Map<THREE.Texture, PaletteReskinner>();

  constructor(
    private readonly model: AnimatedModel,
    private readonly random: Random,
    /** Villager heights are drawn uniformly from this range (metres). */
    private readonly heights = { min: 1.5, max: 1.68 },
  ) {}

  create(halfHeight: number, radius: number) {
    const scene = clone(this.model.scene);
    // The player factory may already have scaled the shared source; start from a clean root.
    scene.scale.setScalar(1);
    scene.position.set(0, 0, 0);
    const look = pickLook(this.random);
    const recoloured = new Map<THREE.Material, THREE.Material>();
    const reskin = (material: THREE.Material) => {
      let copy = recoloured.get(material);
      if (copy) return copy;
      copy = material.clone();
      if (copy instanceof THREE.MeshStandardMaterial && copy.map)
        copy.map = this.reskinner(copy.map).texture(look) ?? copy.map;
      recoloured.set(material, copy);
      return copy;
    };
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.material = Array.isArray(o.material) ? o.material.map(reskin) : reskin(o.material);
    });
    const height = this.random.range(this.heights.min, this.heights.max);
    return new PlayerModelFactory({ scene, animations: this.model.animations }, height).create(halfHeight, radius);
  }

  private reskinner(texture: THREE.Texture): PaletteReskinner {
    let reskinner = this.reskinners.get(texture);
    if (!reskinner) this.reskinners.set(texture, (reskinner = new PaletteReskinner(texture)));
    return reskinner;
  }
}
