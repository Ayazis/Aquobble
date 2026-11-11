import * as THREE from 'three';
import type { CharacterLook } from './CharacterLook';
import { recolourPalette } from './recolourPalette';

/**
 * Makes per-villager copies of the character's palette texture with the swatches of a look repainted.
 * The source texels are read once (through a canvas); each copy is a tiny DataTexture, so a recoloured
 * villager costs one 64x4 texture upload at spawn and nothing per frame.
 */
export class PaletteReskinner {
  private pixels?: Uint8Array;
  private width = 0;

  constructor(private readonly source: THREE.Texture) {}

  /** A recoloured copy of the source, or undefined when its image cannot be read (then keep the original). */
  texture(look: CharacterLook): THREE.Texture | undefined {
    const pixels = this.readSource();
    if (!pixels) return undefined;
    const data = recolourPalette(pixels, this.width, look);
    const texture = new THREE.DataTexture(data, this.width, data.length / (this.width * 4));
    texture.colorSpace = this.source.colorSpace;
    texture.flipY = this.source.flipY;
    texture.magFilter = this.source.magFilter;
    texture.minFilter = this.source.magFilter;
    texture.wrapS = this.source.wrapS;
    texture.wrapT = this.source.wrapT;
    texture.needsUpdate = true;
    return texture;
  }

  private readSource(): Uint8Array | undefined {
    if (this.pixels) return this.pixels;
    const image = this.source.image as CanvasImageSource & { width: number; height: number };
    if (!image || typeof document === 'undefined') return undefined;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    context.drawImage(image, 0, 0);
    this.width = image.width;
    this.pixels = new Uint8Array(context.getImageData(0, 0, image.width, image.height).data.buffer);
    return this.pixels;
  }
}
