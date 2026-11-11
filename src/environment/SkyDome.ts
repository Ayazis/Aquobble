import * as THREE from 'three';
import type { Vec3 } from '@core';
import { paintedSkyShader } from './paintedSkyShader';

/**
 * Stylised hand-painted sky: a banded gradient from horizon to zenith with a warm wash around the sun,
 * coloured from the colour script. An environment map is baked from it so the sky lights the scene.
 */
export class SkyDome {
  readonly sky: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private readonly envScene = new THREE.Scene();
  private pmrem?: THREE.PMREMGenerator;
  private envMap?: THREE.Texture;

  constructor() {
    const material = new THREE.ShaderMaterial({
      ...paintedSkyShader(),
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), material);
    this.sky.scale.setScalar(1000);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -1;
    // Mesh.clone shares the material, so the bake scene follows every uniform change.
    this.envScene.add(this.sky.clone());
  }

  setColours(sun: Vec3, zenith: number, horizon: number, sunColor: number, exposure: number): void {
    const uniforms = this.sky.material.uniforms;
    (uniforms.sunDirection.value as THREE.Vector3).set(sun.x, sun.y, sun.z).normalize();
    (uniforms.zenith.value as THREE.Color).setHex(zenith);
    (uniforms.horizon.value as THREE.Color).setHex(horizon);
    (uniforms.sunColor.value as THREE.Color).setHex(sunColor);
    // ACES darkens mid-tones by about half; undo that and the exposure so the sky shows its scripted colour.
    uniforms.brightness.value = 1.6 / Math.max(exposure, 0.05);
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
