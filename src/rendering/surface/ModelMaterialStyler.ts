import * as THREE from 'three';
import type { SurfaceStyler } from './SurfaceStyler';
import { isMetal, surfaceKindOf } from './surfaceKindOf';

const ROUGHNESS = 0.85;
const METAL = { metalness: 0.6, roughness: 0.5 };

/**
 * Brings models from different packs onto one look: the same matte response to light (the packs ship with
 * a half-metallic sheen of varying glossiness) and, for static models, the shared surface detail textures.
 */
export class ModelMaterialStyler {
  private readonly done = new Set<THREE.Material>();

  constructor(private readonly surfaces: SurfaceStyler) {}

  /** `detail` must be false for anything that moves or is skinned: the detail is anchored in world space. */
  style(model: THREE.Object3D, detail: boolean): void {
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const materials: THREE.Material[] = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) this.styleMaterial(material, detail);
    });
  }

  private styleMaterial(material: THREE.Material, detail: boolean): void {
    if (this.done.has(material) || !(material instanceof THREE.MeshStandardMaterial)) return;
    this.done.add(material);
    const metal = isMetal(material.name);
    material.metalness = metal ? METAL.metalness : 0;
    material.roughness = metal ? METAL.roughness : ROUGHNESS;
    const kind = surfaceKindOf(material.name);
    if (detail && kind) this.surfaces.apply(material, kind);
  }
}
