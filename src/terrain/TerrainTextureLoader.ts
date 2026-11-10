import * as THREE from 'three';
import type { TerrainTextureUniforms } from './TerrainTextureUniforms';

/** Where the terrain detail textures live, relative to the site base URL. */
export interface TerrainTexturePaths {
  grass: string;
  rock: string;
  sand: string;
}

export const DEFAULT_TERRAIN_TEXTURES: TerrainTexturePaths = {
  grass: 'assets/textures/grass.webp',
  rock: 'assets/textures/rock.webp',
  sand: 'assets/textures/sand.webp',
};

/**
 * Loads the detail textures in the background and switches them on once all are in.
 * On failure the terrain keeps its plain palette colours; the game never waits on this.
 */
export class TerrainTextureLoader {
  private readonly loader = new THREE.TextureLoader();

  constructor(private readonly paths: TerrainTexturePaths = DEFAULT_TERRAIN_TEXTURES) {}

  load(uniforms: TerrainTextureUniforms): void {
    void this.loadAll(uniforms).catch((error: unknown) => {
      console.warn('Terrain textures failed to load; using flat colours.', error);
    });
  }

  private async loadAll(uniforms: TerrainTextureUniforms): Promise<void> {
    const [grass, rock, sand] = await Promise.all(
      [this.paths.grass, this.paths.rock, this.paths.sand].map((path) => this.loadOne(path)),
    );
    uniforms.uGrassMap.value = grass;
    uniforms.uRockMap.value = rock;
    uniforms.uSandMap.value = sand;
    // Half strength: the palette colour stays dominant, the texture only adds a painted grain.
    uniforms.uTerrainDetail.value = 0.5;
  }

  private async loadOne(path: string): Promise<THREE.Texture> {
    const texture = await this.loader.loadAsync(import.meta.env.BASE_URL + path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }
}
