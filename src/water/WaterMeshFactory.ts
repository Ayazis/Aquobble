import * as THREE from 'three';
import type { HeightMapUniforms } from '@terrain';
import type { LilyPadFactory } from './LilyPadFactory';
import { seaGeometry } from './seaGeometry';
import type { WaterLook } from './WaterLook';
import type { WaterMesh } from './WaterMesh';
import {
  WATER_FRAGMENT_COLOR,
  WATER_FRAGMENT_GLITTER,
  WATER_FRAGMENT_NORMAL,
  WATER_FRAGMENT_PARS,
  WATER_VERTEX_MAIN,
  WATER_VERTEX_PARS,
} from './waterShaderChunks';

/** Height (m) of the sea's slow swell; ponds lie still. */
const SWELL = 0.06;
const SEA_SEGMENTS = 120;

/**
 * Stylised water as a square sea or a round pond: a clear tinted surface with rippling highlights, pale
 * shallows, a foam line at the shore and streaks of foam further out. The sea rises and falls in a slow
 * swell; ponds are calm, darker and carry lily pads. It is lit by the scene's own sun and sky (so it follows
 * the day cycle) and has no mirror pass, which would redraw the whole world once per water surface. One
 * extra texture read per pixel (the ground height) on all devices.
 */
export class WaterMeshFactory {
  constructor(
    private readonly normals: THREE.Texture,
    private readonly look: WaterLook,
    /** The ground under the water, for the shoreline. */
    private readonly ground: HeightMapUniforms,
    private readonly pads?: LilyPadFactory,
  ) {}

  /** Square sea plane of side `size`. */
  createSea(size = 1000): WaterMesh {
    return this.build(seaGeometry(size, SEA_SEGMENTS), false);
  }

  /** Disc of `radius` for a pond. */
  createPond(radius: number): WaterMesh {
    const pond = this.build(new THREE.CircleGeometry(radius, 32), true);
    if (this.pads) pond.object.add(this.pads.create(radius));
    return pond;
  }

  private build(geometry: THREE.BufferGeometry, calm: boolean): WaterMesh {
    const time = { value: 0 };
    const material = new THREE.MeshStandardMaterial({
      color: this.look.waterColor,
      // Rough enough that the sky's reflection tints the water instead of whitening it.
      roughness: 0.3,
      envMapIntensity: 0.45,
      metalness: 0,
      transparent: true,
      opacity: this.look.opacity,
      depthWrite: false,
    });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.ground, {
        uWaterNormals: { value: this.normals },
        uWaterTime: time,
        uWaterCalm: { value: calm ? 1 : 0 },
        uWaterSwell: { value: calm ? 0 : SWELL },
        uWaterShallow: { value: new THREE.Color(this.look.shallowColor) },
      });
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${WATER_VERTEX_PARS}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${WATER_VERTEX_MAIN}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${WATER_FRAGMENT_PARS}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${WATER_FRAGMENT_COLOR}`)
        .replace('#include <normal_fragment_maps>', WATER_FRAGMENT_NORMAL)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${WATER_FRAGMENT_GLITTER}`);
    };
    material.customProgramCacheKey = () => 'aquobble-water';
    const water = new THREE.Mesh(geometry, material);
    // Planes and discs are built in XY; lay them flat inside a group that TransformSyncSystem is free to move.
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    const object: THREE.Object3D = new THREE.Group().add(water);
    return { object, surface: { time } };
  }
}
