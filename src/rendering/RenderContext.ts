import * as THREE from 'three';
import { HIGH_QUALITY, type RenderQuality } from './RenderQuality';

/** The shared three.js objects: renderer, scene and camera. Owns the canvas. */
export class RenderContext {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;

  constructor(
    container: HTMLElement,
    readonly quality: RenderQuality = HIGH_QUALITY,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, quality.maxPixelRatio));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.renderer.shadowMap.enabled = quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 2000);
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
