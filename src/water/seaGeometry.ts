import * as THREE from 'three';

/** Half-width (m) of the middle of the sea where vertices are evenly and closely spaced. */
export const SEA_DENSE_HALF = 135;
/** Share of the segments spent on that middle; the rest reach, ever longer, for the horizon. */
const DENSE_SHARE = 0.85;

/**
 * A square plane (in XY, like PlaneGeometry) whose vertices crowd into the middle: an even, close grid over
 * the island and its coast for the swell to bend, then a few rows that grow geometrically out to the
 * horizon. `segments` per side.
 */
export function seaGeometry(size: number, segments: number): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(2, 2, segments, segments);
  const positions = geometry.attributes.position;
  const half = size / 2;
  const dense = Math.min(SEA_DENSE_HALF, half);
  const spread = (c: number) => {
    const a = Math.abs(c);
    if (a <= DENSE_SHARE || half <= dense) return (c / DENSE_SHARE) * dense;
    // From the dense grid's edge to the plane's, each row a constant factor longer than the last.
    const t = (a - DENSE_SHARE) / (1 - DENSE_SHARE);
    return Math.sign(c) * dense * (half / dense) ** t;
  };
  for (let i = 0; i < positions.count; i++) positions.setXY(i, spread(positions.getX(i)), spread(positions.getY(i)));
  geometry.computeBoundingSphere();
  return geometry;
}
