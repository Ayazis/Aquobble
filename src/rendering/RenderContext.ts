import * as THREE from 'three';
import { HIGH_QUALITY, type RenderQuality } from './RenderQuality';

/** The shared three.js objects: renderer, scene and camera. Owns the canvas. */
export class RenderContext {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private frame = 0;

  constructor(
    container: HTMLElement,
    readonly quality: RenderQuality = HIGH_QUALITY,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, quality.maxPixelRatio));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = quality.shadowInterval <= 1;
    // Counted per frame (see beginFrame), not per render call: post-processing makes several calls a frame.
    this.renderer.info.autoReset = false;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 2000);
  }

  /**
   * Call once per frame before rendering. The shadow pass redraws every shadow caster on the island, so
   * cheaper profiles refresh it only every few frames; shadows of moving things then lag by a frame or two.
   */
  beginFrame(): void {
    this.renderer.info.reset();
    if (this.quality.shadowInterval <= 1) return;
    if (this.frame++ % this.quality.shadowInterval === 0) this.renderer.shadowMap.needsUpdate = true;
  }

  /** Draw calls and triangles of the last frame, all passes included. */
  stats(): { calls: number; triangles: number } {
    const { calls, triangles } = this.renderer.info.render;
    return { calls, triangles };
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
