import * as THREE from 'three';
import { NO_LANE, type GroundShade } from './groundPatch';
import { valueNoise2 } from './valueNoise2';

const COBBLE = new THREE.Color(0x7f776d);
const COBBLE_DARK = new THREE.Color(0x58524c);
const COBBLE_MOSS = new THREE.Color(0x65675a);

/**
 * Worn cobbles for a square `size` metres across: a trodden darker cross through the middle, broad stains,
 * and a mossy tint and falling cover over the last `feather` metres on all four sides.
 */
export function plazaShade(size: number, feather: number): GroundShade {
  return (x, z, u, v) => {
    const cover = Math.min(1, (Math.min(u, 1 - u, v, 1 - v) * size) / feather);
    const trodden = Math.max(0, 1 - Math.min(Math.abs(u - 0.5), Math.abs(v - 0.5)) / 0.12);
    const stain = Math.max(0, valueNoise2(x * 0.3, z * 0.3, 6) - 0.4);
    const color = COBBLE.clone()
      .lerp(COBBLE_DARK, trodden * 0.25 + stain * 0.5)
      .lerp(COBBLE_MOSS, (1 - cover) * 0.5);
    return { color, cover, lane: NO_LANE };
  };
}
