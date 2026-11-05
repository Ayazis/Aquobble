import * as THREE from 'three';

/** Triangle soup of a model, in the local space of the root it was extracted from. */
export interface CollisionMesh {
  vertices: Float32Array;
  indices: Uint32Array;
}

/**
 * Merges the vertices of every mesh under `root` into one triangle mesh, with node transforms (including scale) applied
 * so the result is expressed in `root`'s local space. Returns null when there are no usable triangles.
 */
export function extractCollisionMesh(root: THREE.Object3D): CollisionMesh | null {
  root.updateMatrixWorld(true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const positions: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const matrix = new THREE.Matrix4();

  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const geometry = node.geometry as THREE.BufferGeometry | undefined;
    const position = geometry?.getAttribute('position');
    if (!geometry || !position) return;
    matrix.multiplyMatrices(toRoot, node.matrixWorld);
    const base = positions.length / 3;
    for (let i = 0; i < position.count; i++) {
      point.fromBufferAttribute(position, i).applyMatrix4(matrix);
      positions.push(point.x, point.y, point.z);
    }
    const index = geometry.getIndex();
    const count = index ? index.count : position.count;
    for (let i = 0; i + 2 < count; i += 3) {
      for (let k = 0; k < 3; k++) indices.push(base + (index ? index.getX(i + k) : i + k));
    }
  });

  if (indices.length === 0 || positions.some((v) => !Number.isFinite(v))) return null;
  return { vertices: new Float32Array(positions), indices: new Uint32Array(indices) };
}
