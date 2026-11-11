import * as THREE from 'three';

const LEAF_COLORS = [0x8a9a3a, 0xc8a03a, 0xb5652a, 0x6f8f35];

/** One InstancedMesh of small two-sided leaf diamonds (about 7 cm), in a few autumn-ish greens and golds. */
export function fallingLeavesMesh(count: number): THREE.InstancedMesh {
  const geometry = new THREE.BufferGeometry();
  const v = [0, 0, -0.04, 0.025, 0, 0, 0, 0, 0.035, 0, 0, -0.04, 0, 0, 0.035, -0.025, 0, 0];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const color = new THREE.Color();
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < count; i++) {
    mesh.setColorAt(i, color.setHex(LEAF_COLORS[i % LEAF_COLORS.length] ?? 0x8a9a3a));
    mesh.setMatrixAt(i, zero);
  }
  return mesh;
}
