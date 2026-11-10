import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ColorGradeShader } from './ColorGradeShader';
import type { RenderContext } from './RenderContext';
import { SceneDepthAoPass } from './SceneDepthAoPass';

/** Post-processing chain: scene → ambient occlusion → bloom → tone mapping/colour output → grade. */
export class PostProcessing {
  private readonly composer: EffectComposer;

  constructor(context: RenderContext) {
    const size = context.renderer.getSize(new THREE.Vector2());
    // The scene pass keeps its depth in a texture so ambient occlusion can read it instead of redrawing.
    const pixels = size.clone().multiplyScalar(context.renderer.getPixelRatio());
    const target = new THREE.WebGLRenderTarget(pixels.x, pixels.y, {
      type: THREE.HalfFloatType,
      samples: context.quality.antialias ? 4 : 0,
    });
    if (context.quality.postEffects) target.depthTexture = new THREE.DepthTexture(pixels.x, pixels.y);
    this.composer = new EffectComposer(context.renderer, target);
    this.composer.setSize(size.x, size.y);
    this.composer.addPass(new RenderPass(context.scene, context.camera));
    if (context.quality.postEffects) {
      this.composer.addPass(this.createAmbientOcclusion(context, size, target.depthTexture));
      this.composer.addPass(new UnrealBloomPass(size, 0.06, 0.3, 6));
    }
    this.composer.addPass(new OutputPass());
    // Phones get the same grade as desktop so the picture only differs in sharpness.
    this.composer.addPass(new ShaderPass(ColorGradeShader));
  }

  render(): void {
    this.composer.render();
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }

  /** Cheap GTAO: few samples, small radius, so creases and contact points darken without a big frame cost. */
  private createAmbientOcclusion(
    context: RenderContext,
    size: THREE.Vector2,
    depth: THREE.DepthTexture | null,
  ): SceneDepthAoPass {
    if (!depth) throw new Error('Ambient occlusion needs the scene depth texture');
    const ao = new SceneDepthAoPass(context.scene, context.camera, size.x, size.y, depth);
    ao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1, scale: 1, samples: 8 });
    ao.updatePdMaterial({ samples: 8, rings: 2, radius: 6 });
    ao.blendIntensity = 0.8;
    return ao;
  }
}
