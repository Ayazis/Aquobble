import * as THREE from 'three';
import type { Random } from '@core';
import { causticLight } from './causticLight';
import { waveHeights } from './waveHeights';

/** The tilt (surface slope, as the x and z of an un-normalised normal) that maps to the ends of a channel. */
export const DETAIL_TILT_RANGE = 0.8;
/** Root-mean-square slope of the patch along each axis: what a fresh breeze does to open water. */
const RMS_SLOPE = 0.2;
/** How hard the ripples bend the light, relative to the tile: about one focus per broad ripple. */
const CAUSTIC_FOCUS = 0.0003;
/** Caustic brightness that maps to a full alpha channel (the average is 1). */
export const CAUSTIC_RANGE = 4;

/**
 * The water's detail map, generated at start (no download): a seamlessly tiling patch of wind ripples from a
 * wave spectrum, with a matching patch of the light those ripples focus on the bed.
 * Red and green: the surface tilt (minus the slope) along the tile's x and y, x being downwind.
 * Blue: the ripple height. Alpha: caustic light on the bed (`CAUSTIC_RANGE` = 1).
 */
export class WaterDetailFactory {
  constructor(private readonly random: Random) {}

  create(size = 256): THREE.DataTexture {
    const heights = waveHeights(size, { low: 3, high: size / 3, falloff: 1.9, directional: 0.55 }, this.random);
    // The caustic net comes from the broad ripples alone: fine ones only blur it.
    const lens = waveHeights(size, { low: 3, high: 14, falloff: 1.2, directional: 0.2 }, this.random);
    const caustic = causticLight(lens, size, CAUSTIC_FOCUS * size * size);
    const at = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)];
    const slopes = new Float32Array(size * size * 2);
    let squares = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 2;
        slopes[i] = (at(x + 1, y) - at(x - 1, y)) / 2;
        slopes[i + 1] = (at(x, y + 1) - at(x, y - 1)) / 2;
        squares += slopes[i] ** 2 + slopes[i + 1] ** 2;
      }
    }
    const gain = RMS_SLOPE / Math.sqrt(squares / (size * size * 2) || 1);
    const byte = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255);
    const data = new Uint8Array(size * size * 4);
    for (let n = 0; n < size * size; n++) {
      data[n * 4] = byte(0.5 - (slopes[n * 2] * gain) / DETAIL_TILT_RANGE / 2);
      data[n * 4 + 1] = byte(0.5 - (slopes[n * 2 + 1] * gain) / DETAIL_TILT_RANGE / 2);
      data[n * 4 + 2] = byte(0.5 + heights[n] / 6);
      data[n * 4 + 3] = byte(caustic[n] / CAUSTIC_RANGE);
    }
    return tiling(new THREE.DataTexture(data, size, size, THREE.RGBAFormat));
  }
}

/** Repeats, with mipmaps and a little anisotropy: water is nearly always seen at a glancing angle. */
export function tiling(texture: THREE.DataTexture): THREE.DataTexture {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
