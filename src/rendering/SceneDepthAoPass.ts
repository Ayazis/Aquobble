import type * as THREE from 'three';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';

/**
 * Ambient occlusion from the depth the scene pass has already drawn. The stock pass draws the whole scene
 * a second time to get depth and normals, which also re-renders the shadow map; this one reads the depth
 * texture of the composer's buffer instead and lets the shader derive normals from it. The composer's
 * render targets must have a depth texture.
 */
export class SceneDepthAoPass extends GTAOPass {
  constructor(scene: THREE.Scene, camera: THREE.Camera, width: number, height: number, depth: THREE.DepthTexture) {
    super(scene, camera, width, height, { depthTexture: depth });
  }

  override render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
    maskActive: boolean,
  ): void {
    // The composer swaps its two buffers, so the scene's depth is in a different texture on some frames.
    const depth = readBuffer.depthTexture;
    if (depth && depth !== this.depthTexture) {
      this.depthTexture = depth;
      this.gtaoMaterial.uniforms.tDepth.value = depth;
      this.pdMaterial.uniforms.tDepth.value = depth;
    }
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
  }
}
