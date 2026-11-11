import * as THREE from 'three';

/** Leaves in one patch: (x, z, size) in metres, laid out once so every patch shares one geometry. */
const LEAVES: readonly [number, number, number][] = [
  [0, 0, 0.13],
  [0.16, 0.05, 0.11],
  [-0.12, 0.13, 0.12],
  [0.04, -0.17, 0.1],
  [-0.18, -0.08, 0.11],
  [0.2, -0.16, 0.09],
  [-0.03, 0.24, 0.1],
];

/**
 * A loose patch of flat leaves lying on the ground: each leaf a pointed diamond (two triangles), turned and
 * tilted a little so the patch catches the light unevenly. Normals point up; colour comes from the instance.
 */
export function leafPatchGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  LEAVES.forEach(([cx, cz, size], i) => {
    const a = i * 2.39996;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const tilt = ((i % 3) - 1) * 0.02;
    // Diamond along the leaf's own axis: tip, side, stem, other side.
    const local: [number, number, number][] = [
      [size, tilt, 0],
      [0, 0.005, size * 0.4],
      [-size * 0.7, -tilt, 0],
      [0, 0.005, -size * 0.4],
    ];
    const world = local.map(([x, y, z]) => [cx + x * c - z * s, y, cz + x * s + z * c]);
    for (const k of [0, 1, 2, 0, 2, 3]) positions.push(...world[k]);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const normals = new Float32Array(positions.length);
  for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  return geometry;
}
