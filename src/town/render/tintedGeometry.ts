import * as THREE from 'three';
import type { Box } from './Box';
import { wallTint, type WallPart } from './wallTint';

/** Horizontal slices per metre on boxes that stand on the ground, so the base gradient has vertices to sit on. */
const ROWS_PER_METRE = 1.4;

/** Non-indexed, vertex-coloured geometry for a box; grounded boxes are sliced so the base gradient shows. */
export function tintedBox({ center, half }: Box, part: WallPart): THREE.BufferGeometry {
  const grounded = Math.abs(center.y - half.y) < 1e-6;
  const rows = grounded ? Math.max(1, Math.ceil(half.y * 2 * ROWS_PER_METRE)) : 1;
  const geo = new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2, 1, rows, 1);
  geo.translate(center.x, center.y, center.z);
  return tint(geo, part);
}

/** Paints `wallTint` per vertex by height; returns a non-indexed geometry with position, normal and color only. */
export function tint(source: THREE.BufferGeometry, part: WallPart): THREE.BufferGeometry {
  const geo = source.index ? source.toNonIndexed() : source;
  if (geo !== source) source.dispose();
  geo.deleteAttribute('uv');
  const pos = geo.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const [r, g, b] = wallTint(part, pos.getY(i));
    c.setRGB(r, g, b, THREE.SRGBColorSpace);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}
