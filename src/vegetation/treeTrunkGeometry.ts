import * as THREE from 'three';

/** Trunk dimensions at scale 1; `ForestSpawner` sizes the collider from these. */
export const TRUNK = { height: 4.2, radius: 0.42 };

/** Radius (as a multiple of `TRUNK.radius`) at each height (as a share of `TRUNK.height`), from below ground up. */
const PROFILE: readonly [height: number, radius: number][] = [
  [-0.08, 2.1],
  [0.03, 1.55],
  [0.12, 1.08],
  [0.3, 0.92],
  [1, 0.6],
];
const SIDES = 6;

/**
 * A six-sided trunk that flares out into roots where it enters the ground. Every other corner of the flare
 * reaches further, so the foot reads as three buttress roots.
 */
export function treeTrunkGeometry(): THREE.BufferGeometry {
  const points = PROFILE.map(([h, r]) => new THREE.Vector2(r * TRUNK.radius, h * TRUNK.height));
  const geometry = new THREE.LatheGeometry(points, SIDES).toNonIndexed();
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const flare = Math.max(1 - y / (TRUNK.height * 0.12), 0);
    const corner = Math.round((Math.atan2(positions.getX(i), positions.getZ(i)) / (Math.PI * 2)) * SIDES);
    const reach = 1 + (corner % 2 === 0 ? 0.3 : -0.15) * flare;
    positions.setXYZ(i, positions.getX(i) * reach, y, positions.getZ(i) * reach);
  }
  geometry.computeVertexNormals();
  return geometry;
}
