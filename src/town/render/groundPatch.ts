import * as THREE from 'three';
import type { Bounds } from '../layout/Bounds';

/** Colour and height offset for one ground vertex. `u`/`v` run 0..1 across the patch in x/z. */
export type GroundShade = (x: number, z: number, u: number, v: number) => { color: THREE.Color; dy: number };

/**
 * A subdivided horizontal patch over `b` at height `y` (town-local, positioned in place), with a
 * vertex colour and a small height offset per vertex from `shade`. Roughly `step` metres per cell.
 */
export function groundPatch(b: Bounds, y: number, step: number, shade: GroundShade): THREE.BufferGeometry {
  const w = b.maxX - b.minX;
  const d = b.maxZ - b.minZ;
  const nx = Math.max(1, Math.round(w / step));
  const nz = Math.max(1, Math.round(d / step));
  const geometry = new THREE.PlaneGeometry(w, d, nx, nz).rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx;
    const z = pos.getZ(i) + cz;
    const { color, dy } = shade(x, z, (x - b.minX) / w, (z - b.minZ) / d);
    pos.setXYZ(i, x, y + dy, z);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}
