import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { ModelMaterialStyler } from './ModelMaterialStyler';

function model(...materials: THREE.Material[]): THREE.Group {
  const group = new THREE.Group();
  for (const material of materials) group.add(new THREE.Mesh(new THREE.BoxGeometry(), material));
  return group;
}

describe('ModelMaterialStyler', () => {
  it('makes non-metal materials matte and keeps metal metallic', () => {
    const wood = new THREE.MeshStandardMaterial({ name: 'Wood', metalness: 0.4, roughness: 0.27 });
    const metal = new THREE.MeshStandardMaterial({ name: 'Metal', metalness: 0.4, roughness: 0.41 });
    new ModelMaterialStyler({ apply: vi.fn() }).style(model(wood, metal), true);
    expect(wood.metalness).toBe(0);
    expect(wood.roughness).toBeCloseTo(0.85);
    expect(metal.metalness).toBeGreaterThan(0.4);
  });

  it('applies surface detail by material name, once per material, and never to metal', () => {
    const apply = vi.fn();
    const wood = new THREE.MeshStandardMaterial({ name: 'DarkWood' });
    const metal = new THREE.MeshStandardMaterial({ name: 'Metal' });
    const styler = new ModelMaterialStyler({ apply });
    styler.style(model(wood, metal, wood), true);
    styler.style(model(wood), true);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith(wood, 'wood');
  });

  it('skips surface detail for moving models', () => {
    const apply = vi.fn();
    new ModelMaterialStyler({ apply }).style(model(new THREE.MeshStandardMaterial({ name: 'Wood' })), false);
    expect(apply).not.toHaveBeenCalled();
  });
});
