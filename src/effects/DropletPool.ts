import * as THREE from 'three';
import type { RippleStamper } from '@water';

const GRAVITY = 9.8;

/**
 * Water droplets for splashes and drips: one InstancedMesh, simple ballistic flight, each drop gone when it
 * falls to its floor (and, if it lands on water, leaving a tiny ripple). Oldest drop is reused when full.
 */
export class DropletPool {
  readonly mesh: THREE.InstancedMesh;
  private readonly state: Float32Array; // x y z vx vy vz floor size, per drop
  private readonly alive: Uint8Array;
  private readonly wetLanding: Uint8Array;
  private readonly dummy = new THREE.Object3D();
  private next = 0;

  constructor(
    private readonly capacity: number,
    private readonly ripples?: RippleStamper,
  ) {
    const material = new THREE.MeshLambertMaterial({ color: 0xe4f4ff, transparent: true, opacity: 0.8 });
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), material, capacity);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = capacity;
    this.mesh.name = 'water-droplets';
    this.state = new Float32Array(capacity * 8);
    this.alive = new Uint8Array(capacity);
    this.wetLanding = new Uint8Array(capacity);
    this.dummy.scale.setScalar(0);
    this.dummy.updateMatrix();
    for (let i = 0; i < capacity; i++) this.mesh.setMatrixAt(i, this.dummy.matrix);
  }

  /** Launches a drop at `p` with velocity `v` that dies at world height `floor`; `onWater` makes it ripple. */
  spawn(p: THREE.Vector3Like, v: THREE.Vector3Like, floor: number, size: number, onWater: boolean): void {
    const i = this.next;
    this.next = (this.next + 1) % this.capacity;
    this.state.set([p.x, p.y, p.z, v.x, v.y, v.z, floor, size], i * 8);
    this.alive[i] = 1;
    this.wetLanding[i] = onWater ? 1 : 0;
  }

  update(dt: number): void {
    const s = this.state;
    const dummy = this.dummy;
    for (let i = 0; i < this.capacity; i++) {
      if (!this.alive[i]) continue;
      const o = i * 8;
      s[o + 4] -= GRAVITY * dt;
      s[o] += s[o + 3] * dt;
      s[o + 1] += s[o + 4] * dt;
      s[o + 2] += s[o + 5] * dt;
      if (s[o + 1] < s[o + 6] && s[o + 4] < 0) {
        this.alive[i] = 0;
        if (this.wetLanding[i]) this.ripples?.stamp(s[o], s[o + 2], 0.12, 0.03);
        dummy.scale.setScalar(0);
      } else {
        dummy.position.set(s[o], s[o + 1], s[o + 2]);
        // Stretched along the fall, like a streak.
        dummy.scale.set(s[o + 7], s[o + 7] * (1 + Math.min(2, Math.abs(s[o + 4]) * 0.2)), s[o + 7]);
      }
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
