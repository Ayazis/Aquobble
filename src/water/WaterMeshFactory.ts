import * as THREE from 'three';
import type { HeightMapUniforms } from '@terrain';
import { markRefractive, SCENE_COLOUR_UNIFORMS } from '@rendering'; // lane H
import { WATER_FRAGMENT_REFRACTION, WATER_REFRACTION_PARS } from './waterRefractionChunk'; // lane H
import { gerstnerGlsl } from './gerstnerGlsl';
import { gerstnerUniforms } from './gerstnerUniforms';
import type { GerstnerTerm } from './GerstnerWaveField';
import type { LilyPadFactory } from './LilyPadFactory';
import { seaGeometry } from './seaGeometry';
import type { WaterLook } from './WaterLook';
import type { WaterMesh } from './WaterMesh';
import type { RippleUniforms } from './RippleUniforms';
import {
  WATER_FRAGMENT_COLOR,
  WATER_FRAGMENT_GLITTER,
  WATER_FRAGMENT_NORMAL,
  WATER_FRAGMENT_PARS,
  WATER_VERTEX_MAIN,
  waterVertexPars,
} from './waterShaderChunks';

/** Dense enough over the island (about 1.5 m between vertices) for the longer Gerstner waves. */
const SEA_SEGMENTS = 200;

/**
 * Stylised water as a square sea or a round pond: a clear tinted surface with rippling highlights, pale
 * shallows, a foam line at the shore and streaks of foam further out. The sea moves in Gerstner waves (the
 * same `waves` the CPU `GerstnerWaveField` uses, so floating things ride them) that shoal near the beach; ponds are calm, darker and carry lily pads. It is lit by the scene's own sun and sky (so it follows
 * the day cycle) and has no mirror pass, which would redraw the whole world once per water surface. One
 * extra texture read per pixel (the ground height) on all devices.
 */
export class WaterMeshFactory {
  /** Water time shared by every surface (and by CPU wave queries): `WaterAnimationSystem` advances it once. */
  readonly time = { value: 0 };
  /** Sea tide offset (m), shared with `Tide` and the CPU `SeaAndPonds`; ponds ignore it. */
  readonly tide = { value: 0 };
  /** Ripple map round the player (2.5), shared by every surface; `RippleSimulation` fills it. Off until then. */
  readonly ripple: RippleUniforms = {
    uRippleMap: { value: null },
    uRippleBox: { value: new THREE.Vector3() },
    uRippleTexel: { value: 0 },
  };

  constructor(
    private readonly normals: THREE.Texture,
    private readonly look: WaterLook,
    /** The ground under the water, for the shoreline. */
    private readonly ground: HeightMapUniforms,
    private readonly pads?: LilyPadFactory,
    private readonly waves: readonly GerstnerTerm[] = [],
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
    const time = this.time;
    const night = { value: 0 };
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
    const waveCount = Math.max(1, this.waves.length);
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.ground, gerstnerUniforms(this.waves), this.ripple, {
        uWaterNormals: { value: this.normals },
        uWaterTime: time,
        uWaterTide: this.tide,
        uWaterNight: night,
        uWaterCalm: { value: calm ? 1 : 0 },
        uWaterSwell: { value: calm ? 0 : 1 },
        uWaterShallow: { value: new THREE.Color(this.look.shallowColor) },
      });
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${waterVertexPars(waveCount)}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${WATER_VERTEX_MAIN}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${WATER_FRAGMENT_PARS}\n${gerstnerGlsl(waveCount)}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${WATER_FRAGMENT_COLOR}`)
        .replace('#include <normal_fragment_maps>', WATER_FRAGMENT_NORMAL)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${WATER_FRAGMENT_GLITTER}`);
      // lane H: refraction
      Object.assign(shader.uniforms, SCENE_COLOUR_UNIFORMS);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${WATER_REFRACTION_PARS}`)
        .replace(WATER_FRAGMENT_GLITTER, `${WATER_FRAGMENT_GLITTER}\n${WATER_FRAGMENT_REFRACTION}`);
      // end lane H
    };
    material.customProgramCacheKey = () => 'aquobble-water';
    const water = new THREE.Mesh(geometry, material);
    // Planes and discs are built in XY; lay them flat inside a group that TransformSyncSystem is free to move.
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    markRefractive(water); // lane H
    const object: THREE.Object3D = new THREE.Group().add(water);
    return { object, surface: { time, night } };
  }
}
