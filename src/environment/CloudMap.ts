import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import type { Vec3 } from '@core';
import { cloudMapFragment, CLOUD_MAP_VERTEX } from './cloudMapShader';
import type { SkyUniforms } from './SkyUniforms';

/** The map is redrawn one band a frame; this many bands make a full refresh. */
const BANDS = 16;
/** A camera jump further than this (m) between frames redraws the whole map at once. */
const TELEPORT = 6;
/** Share of each redraw that goes into the map; the rest is what was there (smooths the march grain). */
const BLEND = 0.35;
/** Full redraws are averaged over this many passes, so a fresh map is as smooth as a settled one. */
const FRESH_PASSES = 4;

/**
 * The volumetric clouds, drawn into a fisheye map of the sky instead of on screen: marching a cloud per
 * screen pixel costs far too much, but clouds drift slowly, so one band of the map a frame is plenty. The
 * sky dome and the image-based lighting then read the map for the price of one texture lookup.
 */
export class CloudMap {
  private readonly target: THREE.WebGLRenderTarget;
  private readonly quad: FullScreenQuad;
  private readonly material: THREE.ShaderMaterial;
  private readonly jitter: { value: number };
  private draws = 0;
  private readonly last = new THREE.Vector3(Infinity, 0, 0);
  private band = 0;
  private stale = true;

  constructor(sky: SkyUniforms, size = 1024, steps = 18) {
    this.target = new THREE.WebGLRenderTarget(size, size, { type: THREE.HalfFloatType, depthBuffer: false });
    this.target.scissorTest = true;
    const material = new THREE.ShaderMaterial({
      uniforms: sky as unknown as Record<string, THREE.IUniform>,
      vertexShader: CLOUD_MAP_VERTEX,
      fragmentShader: cloudMapFragment(steps),
      depthTest: false,
      depthWrite: false,
      // Blends by a constant, not by alpha: the map's alpha is cloud coverage.
      blending: THREE.CustomBlending,
      blendSrc: THREE.ConstantAlphaFactor,
      blendDst: THREE.OneMinusConstantAlphaFactor,
    });
    this.material = material;
    this.jitter = sky.uCloudJitter;
    this.quad = new FullScreenQuad(material);
  }

  /** rgb = cloud colour (premultiplied), a = coverage; see `CLOUD_MAP_UV` for the layout. */
  get texture(): THREE.Texture {
    return this.target.texture;
  }

  /** Redraw everything on the next update (the light or the weather jumped). */
  invalidate(): void {
    this.stale = true;
  }

  /** Draws the next band of the map as seen from `camera` (the whole map after a jump). */
  update(renderer: THREE.WebGLRenderer, camera: Vec3): void {
    if (this.last.distanceTo(camera as THREE.Vector3) > TELEPORT) this.stale = true;
    this.last.set(camera.x, camera.y, camera.z);
    const size = this.target.height;
    const rows = Math.ceil(size / BANDS);
    const fresh = this.stale;
    if (fresh) this.target.scissor.set(0, 0, size, size);
    else this.target.scissor.set(0, this.band * rows, size, rows);
    this.band = fresh ? 0 : (this.band + 1) % BANDS;
    this.stale = false;
    const previous = renderer.getRenderTarget();
    const autoClear = renderer.autoClear;
    // No clear: each pass blends into what the map already holds.
    renderer.autoClear = false;
    renderer.setRenderTarget(this.target);
    for (let pass = 0; pass < (fresh ? FRESH_PASSES : 1); pass++) {
      // A running average over the fresh passes; afterwards each redraw nudges the map towards itself.
      this.material.blendAlpha = fresh ? 1 / (pass + 1) : BLEND;
      this.jitter.value = (this.draws++ * 0.61803) % 1;
      this.quad.render(renderer);
    }
    renderer.setRenderTarget(previous);
    renderer.autoClear = autoClear;
  }
}
