import * as THREE from 'three';
import type { GroundShade } from './groundPatch';
import { valueNoise2 } from './valueNoise2';

const DIRT = new THREE.Color(0x7a6450);
const DIRT_WORN = new THREE.Color(0x5e4b3b);
const DIRT_EDGE = new THREE.Color(0x6f7048);

/**
 * Packed dirt for a road `width` metres wide: broad worn patches, a grassy tint and falling cover over the
 * last `feather` metres of each side. The ends stay solid, so a road can run under the square or a gate.
 */
export function roadShade(alongX: boolean, width: number, feather: number): GroundShade {
  return (x, z, u, v) => {
    const across = alongX ? v : u;
    const cover = Math.min(1, (Math.min(across, 1 - across) * width) / feather);
    const worn = Math.max(0, valueNoise2(x * 0.35, z * 0.35, 1) - 0.3);
    const color = DIRT.clone()
      .lerp(DIRT_WORN, worn * 0.6)
      .lerp(DIRT_EDGE, (1 - cover) * 0.55);
    return { color, cover, lane: (across - 0.5) * width };
  };
}
