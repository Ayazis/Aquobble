import * as THREE from 'three';

/** Half-width (m) of the middle of the sea where vertices are evenly and closely spaced. */
const DENSE_HALF = 150;

/**
 * A square plane (in XY, like PlaneGeometry) whose vertices crowd towards the middle: close enough over the
 * island for a swell to bend it, a few huge quads out to the horizon. `segments` per side.
 */
export function seaGeometry(size: number, segments: number): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(2, 2, segments, segments);
  const positions = geometry.attributes.position;
  const half = size / 2;
  const dense = Math.min(DENSE_HALF, half);
  const spread = (c: number) => Math.sign(c) * (Math.abs(c) * dense + Math.abs(c) ** 6 * (half - dense));
  for (let i = 0; i < positions.count; i++) positions.setXY(i, spread(positions.getX(i)), spread(positions.getY(i)));
  geometry.computeBoundingSphere();
  return geometry;
}
