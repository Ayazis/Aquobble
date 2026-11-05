import * as THREE from 'three';
import type { Random } from '@core';

const WAVES = 24;

/**
 * Procedural, seamlessly tiling water normal map: a sum of sine waves with integer frequencies
 * (so it wraps) and seeded phases and directions. No download needed.
 */
export class WaterNormalsFactory {
  constructor(private readonly random: Random) {}

  create(size = 256): THREE.DataTexture {
    const waves = Array.from({ length: WAVES }, () => this.wave());
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let dx = 0;
        let dy = 0;
        for (const w of waves) {
          const c = w.amplitude * Math.cos(2 * Math.PI * ((w.fx * x + w.fy * y) / size) + w.phase);
          dx += c * w.fx;
          dy += c * w.fy;
        }
        const length = Math.hypot(dx, dy, 1);
        const i = (y * size + x) * 4;
        data[i] = Math.round(((-dx / length) * 0.5 + 0.5) * 255);
        data[i + 1] = Math.round(((-dy / length) * 0.5 + 0.5) * 255);
        data[i + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
        data[i + 3] = 255;
      }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }

  private wave(): { fx: number; fy: number; phase: number; amplitude: number } {
    const fx = Math.round(this.random.range(-12, 12));
    const fy = Math.round(this.random.range(-12, 12)) || 1;
    // Slope ~ amplitude * frequency; keep it roughly equal across octaves.
    const amplitude = 0.5 / Math.max(Math.hypot(fx, fy), 1);
    return { fx, fy, phase: this.random.range(0, Math.PI * 2), amplitude };
  }
}
