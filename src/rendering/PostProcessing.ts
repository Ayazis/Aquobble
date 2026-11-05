import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import type { RenderContext } from './RenderContext';

/** Post-processing chain: scene → ambient occlusion → bloom → tone mapping/colour output. */
export class PostProcessing {
  private readonly composer: EffectComposer;

  constructor(context: RenderContext) {
    const size = context.renderer.getSize(new THREE.Vector2());
    this.composer = new EffectComposer(context.renderer);
    this.composer.addPass(new RenderPass(context.scene, context.camera));
    this.composer.addPass(this.createAmbientOcclusion(context, size));
    this.composer.addPass(new UnrealBloomPass(size, 0.12, 0.4, 2.5));
    this.composer.addPass(new OutputPass());
  }

  render(): void {
    this.composer.render();
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }

  /** Cheap GTAO: few samples, small radius, so creases and contact points darken without a big frame cost. */
  private createAmbientOcclusion(context: RenderContext, size: THREE.Vector2): GTAOPass {
    const ao = new GTAOPass(context.scene, context.camera, size.x, size.y);
    ao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1, scale: 1, samples: 8 });
    ao.updatePdMaterial({ samples: 8, rings: 2, radius: 6 });
    ao.blendIntensity = 0.8;
    return ao;
  }
}
