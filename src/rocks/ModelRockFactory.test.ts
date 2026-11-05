import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { ModelRockFactory } from './ModelRockFactory';

const maxDistance = (points: Float32Array) => {
  let max = 0;
  for (let i = 0; i < points.length; i += 3) max = Math.max(max, Math.hypot(points[i], points[i + 1], points[i + 2]));
  return max;
};

describe('ModelRockFactory', () => {
  // An off-centre, scaled box inside a group, like a glTF scene.
  const template = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 2), new THREE.MeshStandardMaterial());
  box.position.set(10, 5, 0);
  box.scale.setScalar(3);
  template.add(box);

  it('centres the model and scales it to the requested radius', () => {
    const { mesh, hullPoints } = new ModelRockFactory(template).create(1.5);
    expect(maxDistance(hullPoints)).toBeCloseTo(1.5, 5);
    expect(mesh.geometry.attributes.position.count * 3).toBe(hullPoints.length);
  });

  it('does not mutate the template between calls', () => {
    const factory = new ModelRockFactory(template);
    factory.create(5);
    expect(maxDistance(factory.create(1).hullPoints)).toBeCloseTo(1, 5);
  });

  it('keeps quantised (normalised int16) positions intact', () => {
    const q = new THREE.BufferGeometry();
    q.setAttribute(
      'position',
      new THREE.BufferAttribute(new Int16Array([32767, 0, 0, -32767, 0, 0, 0, 32767, 0]), 3, true),
    );
    const group = new THREE.Group().add(new THREE.Mesh(q));
    group.scale.setScalar(100); // like meshopt's dequantisation node scale
    expect(maxDistance(new ModelRockFactory(group).create(2).hullPoints)).toBeCloseTo(2, 3);
  });

  it('rejects a model without meshes', () => {
    expect(() => new ModelRockFactory(new THREE.Group())).toThrow(/no mesh/);
  });
});
