import * as THREE from 'three';
import type { Bounds } from '../layout/Bounds';

/** `lane` value for ground that has no wheel ruts. */
export const NO_LANE = 1000;

/**
 * Look of one ground vertex. `u`/`v` run 0..1 across the patch in x/z. `cover` is 0 on an edge that should
 * fray into the terrain and 1 where the ground is solid; `lane` is the signed distance in metres from the
 * centreline of a road (`NO_LANE` elsewhere).
 */
export type GroundShade = (
  x: number,
  z: number,
  u: number,
  v: number,
) => { color: THREE.Color; cover: number; lane: number };

/**
 * A flat subdivided patch over `b` at height `y` (town-local, positioned in place), with a vertex colour and
 * a `verge` attribute (cover, lane) per vertex from `shade` and a `puddle` attribute from `wetness` (0 without).
 * Roughly `step` metres per cell.
 */
export function groundPatch(
  b: Bounds,
  y: number,
  step: number,
  shade: GroundShade,
  wetness?: (x: number, z: number) => number,
): THREE.BufferGeometry {
  const w = b.maxX - b.minX;
  const d = b.maxZ - b.minZ;
  const nx = Math.max(1, Math.round(w / step));
  const nz = Math.max(1, Math.round(d / step));
  const geometry = new THREE.PlaneGeometry(w, d, nx, nz).rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const verge = new Float32Array(pos.count * 2);
  const puddle = new Float32Array(pos.count);
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx;
    const z = pos.getZ(i) + cz;
    const { color, cover, lane } = shade(x, z, (x - b.minX) / w, (z - b.minZ) / d);
    pos.setXYZ(i, x, y, z);
    colors.set([color.r, color.g, color.b], i * 3);
    verge.set([cover, lane], i * 2);
    puddle[i] = wetness?.(x, z) ?? 0;
  }
  geometry.deleteAttribute('uv');
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('verge', new THREE.BufferAttribute(verge, 2));
  geometry.setAttribute('puddle', new THREE.BufferAttribute(puddle, 1));
  return geometry;
}
