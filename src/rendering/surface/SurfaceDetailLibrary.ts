import * as THREE from 'three';
import { DEFAULT_SURFACE_DETAILS, type SurfaceDetailSources } from './SurfaceDetailSource';
import type { SurfaceKind } from './SurfaceKind';
import type { SurfaceStyler } from './SurfaceStyler';
import {
  DETAIL_FRAGMENT_MAIN,
  DETAIL_FRAGMENT_PARS,
  DETAIL_VERTEX_MAIN,
  DETAIL_VERTEX_PARS,
} from './surfaceDetailChunks';

interface DetailUniforms {
  uDetailMap: { value: THREE.Texture | null };
  uDetailStrength: { value: number };
  uDetailScale: { value: number };
}

/**
 * One detail texture per surface kind, shared by every material of that kind. Materials are patched straight
 * away and show flat colour until `load` brings the textures in; a texture that fails to load stays flat.
 */
export class SurfaceDetailLibrary implements SurfaceStyler {
  private readonly uniforms = new Map<SurfaceKind, DetailUniforms>();

  constructor(private readonly sources: SurfaceDetailSources = DEFAULT_SURFACE_DETAILS) {}

  apply(material: THREE.Material, kind: SurfaceKind): void {
    const source = this.sources[kind];
    if (!source) return;
    const uniforms = this.uniformsFor(kind, source.scale);
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${DETAIL_VERTEX_PARS}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${DETAIL_VERTEX_MAIN}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${DETAIL_FRAGMENT_PARS}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${DETAIL_FRAGMENT_MAIN}`);
    };
    material.customProgramCacheKey = () => 'aquobble-surface-detail';
    material.needsUpdate = true;
  }

  /** Fetches the textures in the background; the game never waits on this. */
  load(): void {
    const loader = new THREE.TextureLoader();
    for (const [kind, source] of Object.entries(this.sources) as [SurfaceKind, (typeof this.sources)[SurfaceKind]][]) {
      if (!source) continue;
      const uniforms = this.uniformsFor(kind, source.scale);
      loader.loadAsync(import.meta.env.BASE_URL + source.path).then(
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 8;
          uniforms.uDetailMap.value = texture;
          uniforms.uDetailStrength.value = source.strength;
        },
        (error: unknown) => console.warn(`Surface texture for "${kind}" failed to load; using flat colour.`, error),
      );
    }
  }

  private uniformsFor(kind: SurfaceKind, scale: number): DetailUniforms {
    let uniforms = this.uniforms.get(kind);
    if (!uniforms) {
      uniforms = { uDetailMap: { value: null }, uDetailStrength: { value: 0 }, uDetailScale: { value: scale } };
      this.uniforms.set(kind, uniforms);
    }
    return uniforms;
  }
}
