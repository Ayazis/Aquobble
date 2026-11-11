import * as THREE from 'three';
import type { Random, Vec3 } from '@core';

/** Half-width (m) of the box of rain kept round the camera, and how high above it drops start. */
const HALF = 18;
const TOP = 16;
const FALL_SPEED = 11;
const STREAK_LENGTH = 0.55;

/** Called for every drop that reaches the ground: (x, z) and the ground height there. */
export type DropLanding = (x: number, z: number, y: number) => void;

/**
 * Rain streaks: one InstancedMesh of thin quads in a box that follows the camera. Each drop falls to the
 * ground height under it, reports its landing and starts again at the top. `count` drops are shown for
 * intensity 1; lighter rain shows fewer.
 */
export class RainField {
  readonly mesh: THREE.InstancedMesh;
  private readonly drops: Float32Array; // x y z per drop
  private readonly dummy = new THREE.Object3D();

  constructor(
    private readonly capacity: number,
    private readonly random: Random,
  ) {
    const geometry = new THREE.PlaneGeometry(0.02, STREAK_LENGTH);
    const material = new THREE.MeshBasicMaterial({
      color: 0xc8d4e0,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    this.mesh = new THREE.InstancedMesh(geometry, material, capacity);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.name = 'rain';
    this.drops = new Float32Array(capacity * 3);
    for (let i = 0; i < capacity; i++) this.respawn(i, { x: 0, y: 0, z: 0 }, this.random.range(-TOP, TOP));
  }

  /**
   * Moves the drops by `dt` s round `center` with wind drift (`windX`, `windZ` m/s), `intensity` 0..1 drops
   * shown. `ground(x, z)` is the height where drops land.
   */
  update(
    dt: number,
    center: Vec3,
    intensity: number,
    windX: number,
    windZ: number,
    ground: (x: number, z: number) => number,
    land: DropLanding,
  ): void {
    const shown = Math.floor(this.capacity * Math.min(1, Math.max(0, intensity)));
    this.mesh.count = shown;
    this.mesh.visible = shown > 0;
    const d = this.drops;
    const tilt = Math.atan2(Math.hypot(windX, windZ), FALL_SPEED);
    this.dummy.rotation.set(0, Math.atan2(windX, windZ), 0, 'YXZ');
    this.dummy.rotateX(tilt);
    for (let i = 0; i < shown; i++) {
      const o = i * 3;
      d[o] += windX * dt;
      d[o + 1] -= FALL_SPEED * dt;
      d[o + 2] += windZ * dt;
      if (Math.abs(d[o] - center.x) > HALF || Math.abs(d[o + 2] - center.z) > HALF) {
        this.respawn(i, center, this.random.range(0, TOP));
      } else {
        const floor = ground(d[o], d[o + 2]);
        if (d[o + 1] < floor) {
          land(d[o], d[o + 2], floor);
          this.respawn(i, center, TOP);
        }
      }
      this.dummy.position.set(d[o], d[o + 1], d[o + 2]);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private respawn(i: number, center: Vec3, height: number): void {
    this.drops[i * 3] = center.x + this.random.range(-HALF, HALF);
    this.drops[i * 3 + 1] = center.y + height;
    this.drops[i * 3 + 2] = center.z + this.random.range(-HALF, HALF);
  }
}
