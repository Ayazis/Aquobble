import * as THREE from 'three';
import { modelParts } from './modelParts';

/** A unit box whose positions are packed as normalised int16 (as meshopt quantisation leaves them). */
function packedBox(): THREE.BufferGeometry {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const p = box.attributes.position;
  const packed = new Int16Array(p.count * 3);
  for (let i = 0; i < packed.length; i++) packed[i] = Math.round((p.array[i] as number) * 32767);
  box.setAttribute('position', new THREE.BufferAttribute(packed, 3, true));
  return box;
}

describe('modelParts', () => {
  it('bakes node transforms without clipping packed positions', () => {
    const node = new THREE.Group();
    node.scale.setScalar(4);
    const material = new THREE.MeshStandardMaterial({ map: new THREE.Texture(), name: 'Leaves' });
    node.add(new THREE.Mesh(packedBox(), material));
    const [part] = modelParts(node);
    part.geometry.computeBoundingBox();
    expect(part.geometry.boundingBox?.max.y).toBeCloseTo(2, 2);
    expect(part.role).toBe('leaves');
    expect((part.material as THREE.MeshStandardMaterial).alphaTest).toBe(0.5);
  });

  it('merges untextured pieces into one coloured part standing on the ground', () => {
    const node = new THREE.Group();
    node.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ name: 'Wood' })));
    node.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ name: 'Green' })));
    const parts = modelParts(node);
    expect(parts).toHaveLength(1);
    parts[0].geometry.computeBoundingBox();
    expect(parts[0].geometry.boundingBox?.min.y).toBeCloseTo(-0.06, 3);
    expect(parts[0].geometry.attributes.color).toBeDefined();
  });
});
