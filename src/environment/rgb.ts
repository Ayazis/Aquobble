import * as THREE from 'three';
import type { Rgb } from './Atmosphere';

const scratch = new THREE.Color();

/** An sRGB hex colour (0xRRGGBB) as linear RGB. */
export function linearRgb(hex: number): Rgb {
  scratch.setHex(hex);
  return [scratch.r, scratch.g, scratch.b];
}

export function scale3(c: Rgb, k: number): Rgb {
  return [c[0] * k, c[1] * k, c[2] * k];
}

export function mix3(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Relative luminance of a linear colour. */
export function luma(c: Rgb): number {
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
