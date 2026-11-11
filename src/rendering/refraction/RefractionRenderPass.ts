import * as THREE from 'three';
import { FullScreenQuad, Pass } from 'three/addons/postprocessing/Pass.js';
import { REFRACTIVE_LAYER, SCENE_COLOUR_UNIFORMS } from './SceneColour';
import { SceneColourCopyShader } from './SceneColourCopyShader';

/**
 * Replaces the plain scene `RenderPass` on desktop: draws everything but the refractive layer, copies that
 * opaque colour (and its depth) into `SCENE_COLOUR_UNIFORMS`, then draws the water on top so it can look
 * through to what is behind it. One extra full-screen copy per frame; needs a read buffer with a depth texture.
 */
export class RefractionRenderPass extends Pass {
  private readonly target: THREE.WebGLRenderTarget;
  private readonly copy = new THREE.ShaderMaterial({
    ...SceneColourCopyShader,
    uniforms: THREE.UniformsUtils.clone(SceneColourCopyShader.uniforms),
  });
  private readonly quad = new FullScreenQuad(this.copy);
  private frames = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
  ) {
    super();
    this.needsSwap = false;
    this.target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
    SCENE_COLOUR_UNIFORMS.uSceneColour.value = this.target.texture;
    SCENE_COLOUR_UNIFORMS.uRefraction.value = 1;
  }

  setSize(width: number, height: number): void {
    this.target.setSize(width, height);
    SCENE_COLOUR_UNIFORMS.uSceneResolution.value.set(width, height);
  }

  render(renderer: THREE.WebGLRenderer, _write: THREE.WebGLRenderTarget, read: THREE.WebGLRenderTarget): void {
    const camera = this.camera;
    const mask = camera.layers.mask;
    camera.layers.disable(REFRACTIVE_LAYER);
    renderer.setRenderTarget(read);
    renderer.clear();
    renderer.render(this.scene, camera);

    // Opaque colour and depth into the scene-colour texture (the read buffer is resolved by now).
    const uniforms = this.copy.uniforms;
    uniforms.tColour.value = read.texture;
    uniforms.tDepth.value = read.depthTexture;
    uniforms.cameraNear.value = camera.near;
    uniforms.cameraFar.value = camera.far;
    renderer.setRenderTarget(this.target);
    this.quad.render(renderer);

    // Water only, over the opaque picture and its depth: no clear, no background, no second shadow pass.
    const { background } = this.scene;
    const autoClear = renderer.autoClear;
    const shadows = renderer.shadowMap.autoUpdate;
    const needsUpdate = renderer.shadowMap.needsUpdate;
    this.scene.background = null;
    renderer.autoClear = false;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = false;
    // three.js drops lights that are not on the camera's layers: the water pass would be unlit (black sea).
    if (this.frames++ % 30 === 0) this.lightWaterLayer();
    camera.layers.set(REFRACTIVE_LAYER);
    renderer.setRenderTarget(read);
    renderer.render(this.scene, camera);
    camera.layers.mask = mask;
    renderer.shadowMap.autoUpdate = shadows;
    renderer.shadowMap.needsUpdate = needsUpdate;
    renderer.autoClear = autoClear;
    this.scene.background = background;
  }

  /** Puts every light on the refractive layer too (lamps can be added after start, so it re-runs now and then). */
  private lightWaterLayer(): void {
    this.scene.traverse((o) => {
      if ((o as THREE.Light).isLight) o.layers.enable(REFRACTIVE_LAYER);
    });
  }

  dispose(): void {
    this.target.dispose();
    this.copy.dispose();
    this.quad.dispose();
  }
}
