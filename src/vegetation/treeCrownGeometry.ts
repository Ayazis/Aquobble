import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Centre and radius of each leaf clump, relative to the tree base (metres). */
const CLUMPS: readonly [x: number, y: number, z: number, radius: number, detail: number][] = [
  [0, 5.6, 0, 2.3, 1],
  [1.5, 4.5, 0.5, 1.5, 0],
  [-1.3, 4.7, -0.8, 1.6, 0],
  [-0.2, 4.3, 1.5, 1.4, 0],
  [0.3, 7.2, -0.3, 1.5, 0],
];

const SHADE = new THREE.Color(0.62, 0.7, 0.62);
const LIGHT = new THREE.Color(1.08, 1.1, 0.95);

/**
 * A rounded canopy of overlapping faceted clumps, as one geometry. Vertex colours run from shaded
 * undersides to sunlit tops, so the crown reads as a soft painted mass; the instance colour tints it.
 */
export function treeCrownGeometry(): THREE.BufferGeometry {
  const clumps = CLUMPS.map(([x, y, z, radius, detail]) =>
    new THREE.IcosahedronGeometry(radius, detail).scale(1, 0.85, 1).translate(x, y, z),
  );
  const crown = mergeGeometries(clumps);
  for (const clump of clumps) clump.dispose();
  crown.computeBoundingBox();
  const { min, max } = crown.boundingBox ?? new THREE.Box3();
  const positions = crown.attributes.position;
  const colours = new Float32Array(positions.count * 3);
  const colour = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const t = (positions.getY(i) - min.y) / (max.y - min.y);
    colour
      .copy(SHADE)
      .lerp(LIGHT, t * t)
      .toArray(colours, i * 3);
  }
  crown.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  return crown;
}
