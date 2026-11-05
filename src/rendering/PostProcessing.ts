import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import type { RenderContext } from './RenderContext';

/** Post-processing chain: scene → bloom → tone mapping/colour output. */
export class PostProcessing {
  private readonly composer: EffectComposer;

  constructor(context: RenderContext) {
    const size = context.renderer.getSize(new THREE.Vector2());
    this.composer = new EffectComposer(context.renderer);
    this.composer.addPass(new RenderPass(context.scene, context.camera));
    this.composer.addPass(new UnrealBloomPass(size, 0.12, 0.4, 2.5));
    this.composer.addPass(new OutputPass());
  }

  render(): void {
    this.composer.render();
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }
}
