import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

/** Physically based sky, plus an environment map generated from it so the sky lights the scene. */
export class SkyDome {
  readonly sky = new Sky();

  constructor(sunDirection: THREE.Vector3) {
    this.sky.scale.setScalar(1000);
    this.sky.material.uniforms.turbidity.value = 6;
    this.sky.material.uniforms.rayleigh.value = 1.8;
    this.sky.material.uniforms.sunPosition.value.copy(sunDirection);
  }

  createEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.add(this.sky.clone());
    const texture = pmrem.fromScene(envScene).texture;
    pmrem.dispose();
    return texture;
  }
}
