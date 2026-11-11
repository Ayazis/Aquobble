import * as THREE from 'three';

/**
 * Two crossed upright quads standing on the origin, `halfWidth` wide each side and 0.5 m tall: a whole tuft as
 * far grass. Like `grassTuftGeometry`, the vertex colour holds the root-to-tip blend weight (0 at the root).
 */
export function grassCardGeometry(halfWidth = 0.35, height = 0.5): THREE.BufferGeometry {
  const positions: number[] = [];
  const colours: number[] = [];
  const normals: number[] = [];
  for (const angle of [0.3, 0.3 + Math.PI / 2]) {
    const c = Math.cos(angle) * halfWidth;
    const s = Math.sin(angle) * halfWidth;
    // The top edge is narrower, so the card reads as a tuft rather than a box.
    const quad = [
      [-c, 0, -s, 0],
      [c, 0, s, 0],
      [c * 0.6, height, s * 0.6, 1],
      [-c, 0, -s, 0],
      [c * 0.6, height, s * 0.6, 1],
      [-c * 0.6, height, -s * 0.6, 1],
    ];
    for (const [x, y, z, w] of quad) {
      positions.push(x, y, z);
      normals.push(0, 1, 0);
      colours.push(w, w, w);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  return g;
}
