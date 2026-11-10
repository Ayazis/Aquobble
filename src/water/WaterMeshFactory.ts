import * as THREE from 'three';
import type { WaterLook } from './WaterLook';
import type { WaterMesh } from './WaterMesh';
import {
  WATER_FRAGMENT_COLOR,
  WATER_FRAGMENT_NORMAL,
  WATER_FRAGMENT_PARS,
  WATER_VERTEX_MAIN,
  WATER_VERTEX_PARS,
} from './waterShaderChunks';

/**
 * Stylised water as a square sea or a round pond: a clear tinted surface with rippling highlights and
 * drifting foam flecks. It is lit by the scene's own sun and sky (so it follows the day cycle) and has no
 * mirror pass, which would redraw the whole world once per water surface.
 */
export class WaterMeshFactory {
  constructor(
    private readonly normals: THREE.Texture,
    private readonly look: WaterLook,
  ) {}

  /** Square sea plane of side `size`. */
  createSea(size = 1000): WaterMesh {
    return this.build(new THREE.PlaneGeometry(size, size));
  }

  /** Disc of `radius` for a pond. */
  createPond(radius: number): WaterMesh {
    return this.build(new THREE.CircleGeometry(radius, 32));
  }

  private build(geometry: THREE.BufferGeometry): WaterMesh {
    const time = { value: 0 };
    const material = new THREE.MeshStandardMaterial({
      color: this.look.waterColor,
      roughness: 0.12,
      metalness: 0,
      transparent: true,
      opacity: this.look.opacity,
      depthWrite: false,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uWaterNormals = { value: this.normals };
      shader.uniforms.uWaterTime = time;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${WATER_VERTEX_PARS}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${WATER_VERTEX_MAIN}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${WATER_FRAGMENT_PARS}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${WATER_FRAGMENT_COLOR}`)
        .replace('#include <normal_fragment_maps>', WATER_FRAGMENT_NORMAL);
    };
    material.customProgramCacheKey = () => 'aquobble-water';
    const water = new THREE.Mesh(geometry, material);
    // Planes and discs are built in XY; lay them flat inside a group that TransformSyncSystem is free to move.
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    return { object: new THREE.Group().add(water), surface: { time } };
  }
}
