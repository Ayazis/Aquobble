import * as THREE from 'three';
import { SeededRandom } from '@core';
import type { RockPlacement } from './RockPlacement';
import { RockScatterFactory } from './RockScatterFactory';
import { RockVariantFactory } from './RockVariantFactory';

const rock = (x: number, z: number, family: RockPlacement['family'], variant: number): RockPlacement => ({
  ...{ x, y: 0, z, yaw: 0, tilt: 0, scale: 1, squash: 1 },
  family,
  variant,
});

describe('RockScatterFactory', () => {
  it('draws one instanced mesh per shape per map cell, skipping unused shapes', () => {
    const variants = new RockVariantFactory(new SeededRandom(1)).createSet(2);
    const factory = new RockScatterFactory(new THREE.MeshStandardMaterial());
    const group = factory.create(
      [rock(1, 1, 'boulder', 0), rock(2, 2, 'boulder', 0), rock(3, 3, 'slab', 1), rock(400, 1, 'boulder', 0)],
      variants,
    );
    const meshes = group.children as THREE.InstancedMesh[];
    expect(meshes.map((m) => m.count).sort()).toEqual([1, 1, 2]);
    expect(meshes.find((m) => m.count === 2)?.geometry).toBe(variants.boulder[0].geometry);
    expect(meshes.every((m) => m.instanceColor !== null)).toBe(true);
  });
});
