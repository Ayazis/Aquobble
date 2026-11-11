import type { GameWorld, Random, System } from '@core';
import { inTallGrass } from '@grass';
import type {} from '@player';
import type { Wind } from '@wind';
import * as THREE from 'three';
import { emitRustle, rustleSize, stepRustle, type RustlePool } from './RustlePool';

/** Motes per second while running through tall grass. */
const RATE = 26;
/** Share of the run speed above which the player counts as running. */
const RUNNING = 0.75;
const MOTE_SIZE = 0.035;

/**
 * Presentation: kicks pollen and seed motes up while the player runs through tall or seed-head grass, and
 * floats them away on the wind, in one InstancedMesh.
 */
export class RustleSystem implements System {
  private readonly players;
  private readonly covers;
  private readonly dummy = new THREE.Object3D();
  private owed = 0;
  private time = 0;

  constructor(
    world: GameWorld,
    private readonly mesh: THREE.InstancedMesh,
    private readonly pool: RustlePool,
    private readonly random: Random,
    private readonly wind?: Wind,
  ) {
    this.players = world.with('player', 'transform');
    this.covers = world.with('tallGrass');
  }

  update(dt: number): void {
    this.time += dt;
    this.emit(dt);
    const dir = this.wind?.direction(this.time) ?? { x: 0, z: 0 };
    const push = 0.4 + 1.6 * (this.wind?.strength(this.time) ?? 0);
    stepRustle(this.pool, dt, dir.x * push, dir.z * push);
    const { mesh, dummy, pool } = this;
    for (let i = 0; i < pool.size; i++) {
      dummy.position.fromArray(pool.position, i * 3);
      dummy.scale.setScalar(Math.max(rustleSize(pool, i) * MOTE_SIZE, 1e-4));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  private emit(dt: number): void {
    const runner = this.players.first;
    if (!runner) return;
    const { player, transform } = runner;
    const speed = Math.hypot(player.moveX, player.moveZ);
    const p = transform.position;
    const tall = [...this.covers].some(({ tallGrass }) => inTallGrass(tallGrass, p.x, p.z));
    if (!tall || !player.grounded || speed < player.runSpeed * RUNNING) {
      this.owed = 0;
      return;
    }
    this.owed += RATE * dt;
    const count = Math.floor(this.owed);
    this.owed -= count;
    if (count > 0) emitRustle(this.pool, this.random, count, p, player.moveX, player.moveZ);
  }
}
