import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import type { Vec3 } from '@core';

/** Physically based sky, plus an environment map baked from it so the sky lights the scene. */
export class SkyDome {
  readonly sky = new Sky();
  private readonly envScene = new THREE.Scene();
  private pmrem?: THREE.PMREMGenerator;
  private envMap?: THREE.Texture;

  constructor() {
    this.sky.scale.setScalar(1000);
    // Mesh.clone shares the material, so the bake scene follows every uniform change.
    this.envScene.add(this.sky.clone());
  }

  setSun(direction: Vec3, turbidity: number, rayleigh: number): void {
    const uniforms = this.sky.material.uniforms;
    uniforms.sunPosition.value.set(direction.x, direction.y, direction.z);
    uniforms.turbidity.value = turbidity;
    uniforms.rayleigh.value = rayleigh;
  }

  /** Re-bakes the environment map from the current sky and disposes the previous one. */
  bakeEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
    this.pmrem ??= new THREE.PMREMGenerator(renderer);
    const texture = this.pmrem.fromScene(this.envScene, 0, 0.1, 100, { size: 128 }).texture;
    this.envMap?.dispose();
    this.envMap = texture;
    return texture;
  }
}
