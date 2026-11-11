import type * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { InkOutlineShader } from './InkOutlineShader';

/**
 * Applies `InkOutlineShader` to the linear scene colour, before tone mapping. Reads the scene depth either
 * from `depthOf` (when an earlier pass already tracks it) or from the incoming buffer.
 */
export class InkOutlinePass extends ShaderPass {
  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    stride: number,
    private readonly depthOf?: () => THREE.Texture | null,
  ) {
    super(InkOutlineShader);
    this.uniforms.stride.value = stride;
  }

  override setSize(width: number, height: number): void {
    this.uniforms.texel.value.set(1 / width, 1 / height);
  }

  override render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
    maskActive: boolean,
  ): void {
    // The composer swaps its two buffers, so the scene's depth is in a different texture on some frames.
    this.uniforms.tDepth.value = this.depthOf?.() ?? readBuffer.depthTexture;
    this.uniforms.cameraNear.value = this.camera.near;
    this.uniforms.cameraFar.value = this.camera.far;
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
  }
}
