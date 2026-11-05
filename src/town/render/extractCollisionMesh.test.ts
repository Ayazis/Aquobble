import * as THREE from 'three';
import { extractCollisionMesh } from './extractCollisionMesh';

describe('extractCollisionMesh', () => {
  it('merges meshes with their node transforms and the root-relative scale', () => {
    const root = new THREE.Group();
    root.position.set(100, 0, 0); // root's own placement is not baked in
    const model = new THREE.Group();
    model.scale.setScalar(2);
    model.position.set(0, 1, 0);
    root.add(model);

    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)); // indexed
    box.position.set(1, 0, 0);
    model.add(box);
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 0, 1], 3)); // non-indexed
    model.add(new THREE.Mesh(tri));

    const mesh = extractCollisionMesh(root);
    if (!mesh) throw new Error('expected a collision mesh');
    const { vertices, indices } = mesh;
    expect(indices.length).toBe(12 * 3 + 3);
    expect(Math.max(...indices)).toBeLessThan(vertices.length / 3);

    const xs = Array.from(vertices.filter((_, i) => i % 3 === 0));
    const ys = Array.from(vertices.filter((_, i) => i % 3 === 1));
    // Box spans x 0.5..1.5 in model space, so 1..3 after scale 2; triangle starts at 0.
    expect(Math.min(...xs)).toBeCloseTo(0);
    expect(Math.max(...xs)).toBeCloseTo(3);
    expect(Math.min(...ys)).toBeCloseTo(0);
    expect(Math.max(...ys)).toBeCloseTo(2);
  });

  it('returns null when there are no triangles', () => {
    expect(extractCollisionMesh(new THREE.Group())).toBeNull();
  });
});
