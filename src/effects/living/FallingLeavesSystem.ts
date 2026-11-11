import * as THREE from 'three';
import type { Random, System, Vec3 } from '@core';
import type { Wind } from '@wind';
import { leafFall, type FallingLeaf } from './leafFall';

/** A tree crown leaves can fall from: its middle, and the ground under it. */
export interface LeafSource {
  x: number;
  crownY: number;
  z: number;
  groundY: number;
}

/** Crowns tried per frame, how near the focus (m) they must be, and leaves torn off per gusty crown. */
const TRIES = 4;
const NEAR = 45;
const BURST = 3;

/**
 * Presentation: when a gust crosses a crown near the focus (the player), it tears a few leaves off; they
 * tumble down and drift with the wind. One InstancedMesh, a fixed pool of leaves, seeded `Random`.
 */
export class FallingLeavesSystem implements System {
  private readonly leaves: FallingLeaf[];
  private readonly dummy = new THREE.Object3D();
  private next = 0;

  constructor(
    private readonly mesh: THREE.InstancedMesh,
    private readonly sources: readonly LeafSource[],
    private readonly wind: Wind,
    /** Wind time (s), the same clock `WindSystem` reports. */
    private readonly clock: () => number,
    private readonly focus: () => Vec3 | undefined,
    private readonly random: Random,
  ) {
    this.leaves = Array.from({ length: mesh.count }, () => ({
      x: 0,
      y: 0,
      z: 0,
      groundY: 0,
      phase: 0,
      age: 0,
      active: false,
    }));
  }

  update(dt: number): void {
    const t = this.clock();
    const dir = this.wind.direction(t);
    this.tearOff(t, dt);
    const { dummy } = this;
    this.leaves.forEach((leaf, i) => {
      if (leaf.active) leafFall(leaf, dt, dir.x, dir.z, this.wind.gust(leaf.x, leaf.z, t));
      dummy.position.set(leaf.x, leaf.y, leaf.z);
      dummy.rotation.set(leaf.age * 3.1 + leaf.phase, leaf.phase * 2, leaf.age * 1.7);
      dummy.scale.setScalar(leaf.active ? 1 : 0);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private tearOff(t: number, dt: number): void {
    const at = this.focus();
    if (!at || this.sources.length === 0) return;
    for (let k = 0; k < TRIES; k++) {
      const s = this.sources[Math.floor(this.random.next() * this.sources.length)];
      if (!s || Math.abs(s.x - at.x) > NEAR || Math.abs(s.z - at.z) > NEAR) continue;
      const gust = this.wind.gust(s.x, s.z, t);
      // Only real gusts tear leaves; about one burst per crown-second at a full gust.
      if (gust < 0.25 || this.random.next() > gust * dt * 60 * 0.05) continue;
      for (let b = 0; b < BURST; b++) this.drop(s);
    }
  }

  private drop(s: LeafSource): void {
    const leaf = this.leaves[this.next];
    this.next = (this.next + 1) % this.leaves.length;
    if (!leaf) return;
    const r = this.random;
    leaf.x = s.x + r.range(-2, 2);
    leaf.y = s.crownY + r.range(-1, 1);
    leaf.z = s.z + r.range(-2, 2);
    leaf.groundY = s.groundY;
    leaf.phase = r.range(0, Math.PI * 2);
    leaf.age = 0;
    leaf.active = true;
  }
}
