import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Centre and radius of each leaf clump, relative to the tree base (metres), and its own tint. */
const CLUMPS: readonly [x: number, y: number, z: number, radius: number, detail: number, tint: number][] = [
  [0, 5.6, 0, 2.3, 1, 1],
  [1.5, 4.5, 0.5, 1.5, 0, 0.9],
  [-1.3, 4.7, -0.8, 1.6, 0, 1.06],
  [-0.2, 4.3, 1.5, 1.4, 0, 0.95],
  [0.3, 7.2, -0.3, 1.5, 0, 1.1],
];
/** Local height where the crown starts; below this nothing sways. */
export const CROWN_BASE = 3;
const CORE = new THREE.Vector3(0, 5.4, 0);
const UNDERSIDE = new THREE.Color(0.4, 0.5, 0.45);
const SIDE = new THREE.Color(0.8, 0.86, 0.74);
const TOP = new THREE.Color(1.1, 1.12, 0.94);

/**
 * A rounded canopy of overlapping faceted clumps, as one geometry. Vertex colours are painted per facet:
 * dark, cool undersides and inner faces, bright warm tops, and a slightly different green per clump, so the
 * crown has depth from any angle (also from below). The instance colour tints the whole tree.
 */
export function treeCrownGeometry(): THREE.BufferGeometry {
  const clumps = CLUMPS.map(([x, y, z, radius, detail, tint]) => {
    const clump = new THREE.IcosahedronGeometry(radius, detail).scale(1, 0.85, 1).translate(x, y, z);
    clump.computeVertexNormals();
    paint(clump, tint);
    return clump;
  });
  const crown = mergeGeometries(clumps);
  for (const clump of clumps) clump.dispose();
  return crown;
}

function paint(clump: THREE.BufferGeometry, tint: number): void {
  const positions = clump.attributes.position;
  const normals = clump.attributes.normal;
  const colours = new Float32Array(positions.count * 3);
  const colour = new THREE.Color();
  const centre = new THREE.Vector3();
  const normal = new THREE.Vector3();
  // The geometry is not indexed: every three vertices are one facet, painted one colour.
  for (let i = 0; i < positions.count; i += 3) {
    centre.set(0, 0, 0);
    for (let k = 0; k < 3; k++) centre.add(normal.fromBufferAttribute(positions, i + k));
    centre.divideScalar(3);
    normal.fromBufferAttribute(normals, i);
    if (normal.y < 0) colour.copy(SIDE).lerp(UNDERSIDE, Math.min(-normal.y * 1.6, 1));
    else colour.copy(SIDE).lerp(TOP, normal.y * normal.y);
    // Facets that look into the crown rather than out of it sit in its shade.
    const outward = normal.dot(centre.sub(CORE).normalize());
    colour.multiplyScalar(tint * (outward < 0.1 ? 0.72 : 1));
    for (let k = 0; k < 3; k++) colour.toArray(colours, (i + k) * 3);
  }
  clump.setAttribute('color', new THREE.BufferAttribute(colours, 3));
}
