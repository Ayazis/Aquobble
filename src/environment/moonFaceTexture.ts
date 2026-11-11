import * as THREE from 'three';
import type { MoonPatch } from './MoonPatch';

const SIZE = 128;

/**
 * The moon's face in a canvas: a pale disc with a crisp edge, slightly darker towards the rim, with soft grey
 * seas and craters painted on it. Outside the disc the canvas is transparent.
 */
export function moonFaceTexture(patches: readonly MoonPatch[]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  const c = SIZE / 2;
  const radius = c - 2;
  const disc = ctx.createRadialGradient(c - radius * 0.2, c - radius * 0.2, 0, c, c, radius);
  disc.addColorStop(0, '#ffffff');
  disc.addColorStop(1, '#d9dde6');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(c, c, radius, 0, Math.PI * 2);
  ctx.fill();
  // Seas and craters only darken what is already painted, so they never spill past the edge.
  ctx.globalCompositeOperation = 'source-atop';
  for (const patch of patches) {
    const x = c + patch.x * radius;
    const y = c + patch.y * radius;
    const r = patch.radius * radius;
    const shade = ctx.createRadialGradient(x, y, 0, x, y, r);
    shade.addColorStop(0, `rgba(96,104,128,${patch.darkness})`);
    shade.addColorStop(0.7, `rgba(96,104,128,${patch.darkness * 0.8})`);
    shade.addColorStop(1, 'rgba(96,104,128,0)');
    ctx.fillStyle = shade;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
