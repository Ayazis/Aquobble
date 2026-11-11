import * as THREE from 'three';
import type { System } from '@core';
import type { SwarmKind, SwarmMember } from './SwarmKind';
import { swarmPose, swarmVisibility, type SwarmPose } from './swarmPose';

/** Presentation: poses every member of one swarm from the clock, scaled down to nothing when out of its hours. */
export class SwarmSystem implements System {
  private time = 0;
  private readonly pose: SwarmPose = { x: 0, y: 0, z: 0, yaw: 0, pulse: 0 };
  private readonly dummy = new THREE.Object3D();

  constructor(
    private readonly kind: SwarmKind,
    private readonly members: readonly SwarmMember[],
    private readonly mesh: THREE.InstancedMesh,
    /** 0 by day, 1 at night. */
    private readonly night: () => number,
  ) {}

  update(dt: number): void {
    this.time += dt;
    const shown = swarmVisibility(this.kind, this.night());
    this.mesh.visible = shown > 0.01;
    if (!this.mesh.visible) return;
    const { dummy, pose, kind } = this;
    this.members.forEach((m, i) => {
      swarmPose(kind, m, this.time, pose);
      dummy.position.set(pose.x, pose.y, pose.z);
      dummy.rotation.set(0, pose.yaw, 0);
      if (kind === 'butterfly') {
        // Flap: the wings fold up by narrowing and lifting a little.
        dummy.scale.set(shown * (0.15 + 0.85 * pose.pulse), shown, shown);
        dummy.position.y += 0.02 * (1 - pose.pulse);
      } else {
        dummy.scale.setScalar(shown * (kind === 'firefly' ? 0.2 + 0.8 * pose.pulse : 1));
      }
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
