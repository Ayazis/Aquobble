import type { System } from '@core';
import * as THREE from 'three';
import type { SmokeConfig } from './SmokeConfig';
import type { SmokeSource } from './SmokeSource';
import { SMOKE_FADE_ATTRIBUTE } from './smokeFadeAttribute';
import { smokePuff } from './smokePuff';

/** Presentation: moves every chimney's puffs up and downwind, growing and fading them, in one InstancedMesh. */
export class SmokeSystem implements System {
  private time = 0;
  private readonly dummy = new THREE.Object3D();
  private readonly windX: number;
  private readonly windZ: number;

  constructor(
    private readonly mesh: THREE.InstancedMesh,
    private readonly sources: readonly SmokeSource[],
    private readonly config: SmokeConfig,
  ) {
    this.windX = Math.cos(config.windDirection);
    this.windZ = Math.sin(config.windDirection);
  }

  update(dt: number): void {
    this.time += dt;
    const { mesh, dummy, config } = this;
    const fade = mesh.geometry.getAttribute(SMOKE_FADE_ATTRIBUTE) as THREE.InstancedBufferAttribute;
    const count = config.puffsPerChimney;
    let i = 0;
    for (const source of this.sources) {
      const { x, y, z } = source.position;
      for (let p = 0; p < count; p++, i++) {
        const pose = smokePuff(this.time, p, count, source.phase, config);
        dummy.position.set(x + this.windX * pose.drift, y + pose.rise, z + this.windZ * pose.drift);
        dummy.rotation.set(p, p * 1.7 + pose.rise * 0.3, 0);
        dummy.scale.setScalar(pose.size);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        fade.setX(i, pose.fade);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    fade.needsUpdate = true;
  }
}
