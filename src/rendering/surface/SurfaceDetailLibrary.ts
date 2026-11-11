import * as THREE from 'three';
import { DEFAULT_SURFACE_DETAILS, type SurfaceDetailSources } from './SurfaceDetailSource';
import type { SurfaceKind } from './SurfaceKind';
import type { SurfaceStyler } from './SurfaceStyler';
import { PALETTE_FRAGMENT_MAIN, PALETTE_FRAGMENT_PARS, PALETTE_KINDS } from './paletteDetailChunks';
import {
  DETAIL_FRAGMENT_MAIN,
  DETAIL_FRAGMENT_PARS,
  DETAIL_NORMAL_MAIN,
  DETAIL_VERTEX_MAIN,
  DETAIL_VERTEX_PARS,
} from './surfaceDetailChunks';

interface DetailUniforms {
  uDetailMap: { value: THREE.Texture | null };
  uDetailStrength: { value: number };
  uDetailScale: { value: number };
  uDetailNormalMap: { value: THREE.Texture | null };
  uDetailNormalStrength: { value: number };
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
      if (!source.normalPath) return;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>\n${DETAIL_NORMAL_MAIN}`,
      );
    };
    // Two programs at most: kinds with a normal map pay for its texture read, the others do not.
    const key = source.normalPath ? 'aquobble-surface-detail-normal' : 'aquobble-surface-detail';
    material.customProgramCacheKey = () => key;
    material.needsUpdate = true;
  }

  /** A palette-textured model: each colour region (roof, door, footing, wall) gets its own kind's grain. */
  applyPalette(material: THREE.Material): void {
    const uniforms: Record<string, { value: unknown }> = {};
    PALETTE_KINDS.forEach((kind, i) => {
      const source = this.sources[kind];
      const own = this.uniformsFor(kind, source?.scale ?? 1);
      uniforms[`uPaletteMap${i}`] = own.uDetailMap;
      uniforms[`uPaletteStrength${i}`] = own.uDetailStrength;
      uniforms[`uPaletteScale${i}`] = own.uDetailScale;
    });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${DETAIL_VERTEX_PARS}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${DETAIL_VERTEX_MAIN}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vDetailPos;\n${PALETTE_FRAGMENT_PARS}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${PALETTE_FRAGMENT_MAIN}`);
    };
    material.customProgramCacheKey = () => 'aquobble-surface-palette';
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
      if (!source.normalPath) continue;
      loader.loadAsync(import.meta.env.BASE_URL + source.normalPath).then(
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.anisotropy = 8;
          uniforms.uDetailNormalMap.value = texture;
          uniforms.uDetailNormalStrength.value = source.normalStrength ?? 1;
        },
        (error: unknown) => console.warn(`Normal map for "${kind}" failed to load; staying flat.`, error),
      );
    }
  }

  private uniformsFor(kind: SurfaceKind, scale: number): DetailUniforms {
    let uniforms = this.uniforms.get(kind);
    if (!uniforms) {
      uniforms = {
        uDetailMap: { value: null },
        uDetailStrength: { value: 0 },
        uDetailScale: { value: scale },
        uDetailNormalMap: { value: null },
        uDetailNormalStrength: { value: 0 },
      };
      this.uniforms.set(kind, uniforms);
    }
    return uniforms;
  }
}
