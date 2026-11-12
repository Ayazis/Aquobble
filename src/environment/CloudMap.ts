import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import type { Vec3 } from '@core';
import { cloudMapFragment, CLOUD_MAP_VERTEX } from './cloudMapShader';
import type { SkyUniforms } from './SkyUniforms';

/** The map is redrawn one band a frame; this many bands make a full refresh. */
const BANDS = 16;
/** A camera jump further than this (m) between frames redraws the whole map at once. */
const TELEPORT = 6;

/**
 * The volumetric clouds, drawn into a fisheye map of the sky instead of on screen: marching a cloud per
 * screen pixel costs far too much, but clouds drift slowly, so one band of the map a frame is plenty. The
 * sky dome and the image-based lighting then read the map for the price of one texture lookup.
 */
export class CloudMap {
  private readonly target: THREE.WebGLRenderTarget;
  private readonly quad: FullScreenQuad;
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
    });
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
    if (this.stale) this.target.scissor.set(0, 0, size, size);
    else this.target.scissor.set(0, this.band * rows, size, rows);
    this.band = this.stale ? 0 : (this.band + 1) % BANDS;
    this.stale = false;
    const previous = renderer.getRenderTarget();
    renderer.setRenderTarget(this.target);
    this.quad.render(renderer);
    renderer.setRenderTarget(previous);
  }
}
