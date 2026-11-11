import * as THREE from 'three';
import type { Random, System } from '@core';
import { fishJump, fishRipple, JUMP_TIME } from './fishRipple';

/** A pond fish can rise in: centre, radius (m) and water surface height. */
export interface FishPond {
  x: number;
  z: number;
  radius: number;
  level: number;
}

interface Rise {
  x: number;
  z: number;
  yaw: number;
  age: number;
  jumps: boolean;
}

/** Seconds between rises in one pond, and the share of rises that are full jumps. */
const GAP: [number, number] = [2.5, 9];
const JUMPS = 0.35;
/** Metres a jump covers. */
const JUMP_LENGTH = 0.8;

/**
 * Presentation: fish rising in the ponds. Each rise rings the water (a self-contained visual ring, no water
 * simulation); some leap out in a short arc and ring the water again where they fall back in.
 */
export class PondFishSystem implements System {
  private readonly rises: Rise[] = [];
  private readonly timers: number[];
  private readonly dummy = new THREE.Object3D();
  private readonly color = new THREE.Color();

  constructor(
    private readonly ponds: readonly FishPond[],
    private readonly rings: THREE.InstancedMesh,
    private readonly fish: THREE.InstancedMesh,
    private readonly random: Random,
  ) {
    this.timers = ponds.map(() => random.range(0, GAP[1]));
  }

  update(dt: number): void {
    this.ponds.forEach((pond, i) => {
      this.timers[i] = (this.timers[i] ?? 0) - dt;
      if ((this.timers[i] ?? 0) > 0) return;
      this.timers[i] = this.random.range(GAP[0], GAP[1]);
      const angle = this.random.range(0, Math.PI * 2);
      const r = Math.sqrt(this.random.next()) * pond.radius * 0.6;
      const rise = { x: pond.x + Math.cos(angle) * r, z: pond.z + Math.sin(angle) * r, age: 0 };
      this.rises.push({ ...rise, yaw: this.random.range(0, Math.PI * 2), jumps: this.random.next() < JUMPS });
    });
    for (const rise of this.rises) rise.age += dt;
    const live = this.rises.filter((r) => fishRipple(r.age - (r.jumps ? JUMP_TIME : 0)).fade > 0 || r.age < JUMP_TIME);
    this.rises.splice(0, this.rises.length, ...live);
    this.draw();
  }

  private level(x: number, z: number): number {
    const pond = this.ponds.find((p) => (p.x - x) ** 2 + (p.z - z) ** 2 <= p.radius ** 2);
    return (pond?.level ?? 0) + 0.02;
  }

  private draw(): void {
    let ring = 0;
    let fish = 0;
    const { dummy } = this;
    const put = (mesh: THREE.InstancedMesh, i: number, scale: number, fade: number): void => {
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, this.color.setRGB(0.5 * fade, 0.55 * fade, 0.6 * fade));
    };
    for (const rise of this.rises) {
      const dx = Math.sin(rise.yaw) * JUMP_LENGTH;
      const dz = Math.cos(rise.yaw) * JUMP_LENGTH;
      const y = this.level(rise.x, rise.z);
      const start = fishRipple(rise.age);
      dummy.rotation.set(0, 0, 0);
      if (start.fade > 0 && ring < this.rings.count) {
        dummy.position.set(rise.x, y, rise.z);
        put(this.rings, ring++, start.radius, start.fade);
      }
      if (!rise.jumps) continue;
      const end = fishRipple(rise.age - JUMP_TIME);
      if (end.fade > 0 && ring < this.rings.count) {
        dummy.position.set(rise.x + dx, y, rise.z + dz);
        put(this.rings, ring++, end.radius, end.fade);
      }
      const jump = fishJump(rise.age);
      if (jump && fish < this.fish.count) {
        dummy.position.set(rise.x + dx * jump.along, y + jump.lift, rise.z + dz * jump.along);
        dummy.rotation.set((jump.along - 0.5) * 2, rise.yaw, 0);
        put(this.fish, fish++, 1, 1);
      }
    }
    for (let i = ring; i < this.rings.count; i++) put(this.rings, i, 0, 0);
    for (let i = fish; i < this.fish.count; i++) put(this.fish, i, 0, 1);
    for (const mesh of [this.rings, this.fish]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }
}
