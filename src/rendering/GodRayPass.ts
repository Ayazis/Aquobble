import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import type { Vec3 } from '@core';
import { GodRayShader } from './GodRayShader';
import type { LightShafts } from './LightShafts';

/** Lane D2: the light-shaft pass (desktop only). Fades out as the sun leaves the screen or goes behind. */
export class GodRayPass extends ShaderPass implements LightShafts {
  private readonly sun = new THREE.Vector3(0, 1, 0);
  private readonly projected = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private baseStrength = 0;

  constructor(
    private readonly camera: THREE.Camera,
    private readonly depthOf?: () => THREE.Texture | null,
  ) {
    super(GodRayShader);
  }

  setLightShafts(direction: Vec3, color: readonly [number, number, number], strength: number): void {
    this.sun.set(direction.x, direction.y, direction.z);
    this.uniforms.color.value.fromArray(color);
    this.baseStrength = strength;
  }

  override render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
    maskActive: boolean,
  ): void {
    this.uniforms.tDepth.value = this.depthOf?.() ?? readBuffer.depthTexture;
    this.camera.getWorldDirection(this.forward);
    const facing = this.forward.dot(this.sun);
    // A point far along the sun direction from the camera, projected to 0..1 screen space.
    this.projected.copy(this.sun).multiplyScalar(1000).add(this.camera.position).project(this.camera);
    this.uniforms.sunScreen.value.set(this.projected.x * 0.5 + 0.5, this.projected.y * 0.5 + 0.5);
    const inView = THREE.MathUtils.smoothstep(facing, 0.1, 0.5);
    this.uniforms.strength.value = this.baseStrength * inView;
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
  }
}
