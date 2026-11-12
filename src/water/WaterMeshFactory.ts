import * as THREE from 'three';
import type { HeightMapUniforms } from '@terrain';
import { markRefractive, SCENE_COLOUR_UNIFORMS } from '@rendering'; // lane H
import { gerstnerUniforms } from './gerstnerUniforms';
import type { GerstnerTerm } from './GerstnerWaveField';
import type { LilyPadFactory } from './LilyPadFactory';
import type { RippleUniforms } from './RippleUniforms';
import { seaGeometry, SEA_DENSE_HALF } from './seaGeometry';
import { patchWaterShader } from './shader/patchWaterShader';
import type { WaterDetail } from './WaterDetail';
import type { WaterLook } from './WaterLook';
import type { WaterMesh } from './WaterMesh';

/** A wave needs this many vertices along its length before the mesh can carry it without jagging. */
const VERTICES_PER_WAVE = 4.5;

/**
 * Water as a square sea or a round pond: a clear surface that mirrors the sky and the island, with pale
 * shallows you can see the bed through (caustics dancing on it), surf and foam at the shore and whitecaps
 * further out. The sea moves in Gerstner waves (the same `waves` the CPU wave field uses, so floating things
 * ride them) and surf; ponds are calm, darker and carry lily pads. It is lit by the scene's own sun and sky
 * (so it follows the day cycle) and has no mirror pass, which would redraw the whole world once per surface.
 */
export class WaterMeshFactory {
  /** Water time shared by every surface (and by CPU wave queries): `WaterAnimationSystem` advances it once. */
  readonly time = { value: 0 };
  /** Sea tide offset (m), shared with `Tide` and the CPU `SeaAndPonds`; ponds ignore it. */
  readonly tide = { value: 0 };
  /** Sea state: how tall the swell and surf run (1 = a fresh breeze). `SeaStateSystem` drives it; ponds ignore it. */
  readonly swell = { value: 1 };
  /** Unit direction the wind blows towards (xy = world xz, fixed) and its strength 0..1 right now (z). */
  readonly wind = { value: new THREE.Vector3(1, 0, 0.5) };
  /** Ripple map round the player (2.5), shared by every surface; `RippleSimulation` fills it. Off until then. */
  readonly ripple: RippleUniforms = {
    uRippleMap: { value: null },
    uRippleBox: { value: new THREE.Vector3() },
    uRippleTexel: { value: 0 },
  };

  constructor(
    private readonly detail: WaterDetail,
    private readonly look: WaterLook,
    /** The ground under the water, for the shoreline. */
    private readonly ground: HeightMapUniforms,
    private readonly pads?: LilyPadFactory,
    /** Longest first: the mesh carries as many of them as its vertices can. */
    private readonly waves: readonly GerstnerTerm[] = [],
  ) {}

  /** Square sea plane of side `size`. */
  createSea(size = 4000): WaterMesh {
    const segments = this.detail.seaSegments;
    const spacing = (2 * Math.min(SEA_DENSE_HALF, size / 2)) / (segments * 0.85);
    return this.build(seaGeometry(size, segments), false, spacing);
  }

  /** Disc of `radius` for a pond. */
  createPond(radius: number): WaterMesh {
    const pond = this.build(new THREE.CircleGeometry(radius, 32), true, radius);
    if (this.pads) pond.object.add(this.pads.create(radius));
    return pond;
  }

  private build(geometry: THREE.BufferGeometry, calm: boolean, spacing: number): WaterMesh {
    const time = this.time;
    const night = { value: 0 };
    const material = new THREE.MeshStandardMaterial({
      color: this.look.waterColor,
      envMapIntensity: 1,
      metalness: 0,
      transparent: true,
      opacity: this.look.opacity,
      depthWrite: this.detail.drawnLast,
    });
    if (this.detail.fine) material.defines = { ...material.defines, WATER_FINE: '' };
    const waveCount = Math.max(1, this.waves.length);
    const carried = this.waves.filter((w) => (2 * Math.PI) / w.k >= spacing * VERTICES_PER_WAVE).length;
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.ground, gerstnerUniforms(this.waves), this.ripple, SCENE_COLOUR_UNIFORMS, {
        uWaterNormals: { value: this.detail.detailMap },
        uWaterFoamMap: { value: this.detail.foamMap },
        uWaterTime: time,
        uWaterTide: this.tide,
        uWaterNight: night,
        uWaterWind: this.wind,
        uWaterCalm: { value: calm ? 1 : 0 },
        uWaterSwell: calm ? { value: 0 } : this.swell,
        uWaterShallow: { value: new THREE.Color(this.look.shallowColor) },
      });
      patchWaterShader(shader, waveCount, carried);
    };
    material.customProgramCacheKey = () => `aquobble-water-${waveCount}-${carried}`;
    const water = new THREE.Mesh(geometry, material);
    // Planes and discs are built in XY; lay them flat inside a group that TransformSyncSystem is free to move.
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    markRefractive(water); // lane H
    const object: THREE.Object3D = new THREE.Group().add(water);
    return { object, surface: { time, night } };
  }
}
