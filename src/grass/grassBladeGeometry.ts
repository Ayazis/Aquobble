import * as THREE from 'three';

/**
 * One blade as a strip of `segments` quads ending in a point. Positions are not in metres: x is the side of
 * the blade (-1 or 1, 0 at the tip) and y how far along it (0 at the root, 1 at the tip). The vertex shader
 * bends that onto a curve (see `grassBladeVertex`), so one small strip serves every blade of a band.
 */
export function grassBladeGeometry(segments: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const index: number[] = [];
  for (let s = 0; s < segments; s++) {
    const t = s / segments;
    positions.push(-1, t, 0, 1, t, 0);
  }
  positions.push(0, 1, 0);
  for (let s = 0; s < segments - 1; s++) {
    const a = s * 2;
    index.push(a, a + 1, a + 3, a, a + 3, a + 2);
  }
  const last = (segments - 1) * 2;
  index.push(last, last + 1, last + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  // A stand-in normal: the shader works out the real one, but three.js wants the attribute for shadow bias.
  const normals = positions.map((_, i) => (i % 3 === 1 ? 1 : 0));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setIndex(index);
  return g;
}
