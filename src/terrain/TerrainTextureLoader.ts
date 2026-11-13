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
 * Loads the detail textures and their normal maps (`<name>-normal.webp`) in the background and switches each
 * set on once it is in. On failure the terrain keeps its plain palette colours; the game never waits on this.
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
    const paths = [this.paths.grass, this.paths.rock, this.paths.sand];
    const [grass, rock, sand] = await Promise.all(paths.map((path) => this.loadOne(path, true)));
    uniforms.uGrassMap.value = grass;
    uniforms.uRockMap.value = rock;
    uniforms.uSandMap.value = sand;
    // The palette colour sets the hue; the texture carries most of the light and dark.
    uniforms.uTerrainDetail.value = 0.8;
    const normals = paths.map((path) => this.loadOne(path.replace('.webp', '-normal.webp'), false));
    const [grassN, rockN, sandN] = await Promise.all(normals);
    uniforms.uGrassNormal.value = grassN;
    uniforms.uRockNormal.value = rockN;
    uniforms.uSandNormal.value = sandN;
    uniforms.uTerrainRelief.value = 1;
  }

  private async loadOne(path: string, colour: boolean): Promise<THREE.Texture> {
    const texture = await this.loader.loadAsync(import.meta.env.BASE_URL + path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    if (colour) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }
}
