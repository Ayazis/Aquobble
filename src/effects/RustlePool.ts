import type { Random } from '@core';

/** Seconds a pollen/seed mote lives. */
export const RUSTLE_LIFE = 1.4;
const GRAVITY = 1.2;
const DRAG = 1.6;

/**
 * Fixed pool of pollen and seed motes kicked up from tall grass. Flat arrays (x, y, z and velocity per
 * mote, plus age); a mote with age >= RUSTLE_LIFE is free.
 */
export interface RustlePool {
  size: number;
  position: Float32Array;
  velocity: Float32Array;
  age: Float32Array;
  /** Next slot to reuse (round robin). */
  next: number;
}

export function createRustlePool(size: number): RustlePool {
  return {
    size,
    position: new Float32Array(size * 3),
    velocity: new Float32Array(size * 3),
    age: new Float32Array(size).fill(RUSTLE_LIFE),
    next: 0,
  };
}

/** Kicks `count` motes up from around (x, y, z), thrown a little along the runner's motion (vx, vz). */
export function emitRustle(
  pool: RustlePool,
  random: Random,
  count: number,
  at: { x: number; y: number; z: number },
  vx: number,
  vz: number,
): void {
  for (let n = 0; n < count; n++) {
    const i = pool.next;
    pool.next = (pool.next + 1) % pool.size;
    pool.position.set(
      [at.x + random.range(-0.4, 0.4), at.y + random.range(0.3, 0.8), at.z + random.range(-0.4, 0.4)],
      i * 3,
    );
    pool.velocity.set(
      [vx * 0.25 + random.range(-0.6, 0.6), random.range(0.6, 1.5), vz * 0.25 + random.range(-0.6, 0.6)],
      i * 3,
    );
    pool.age[i] = random.range(0, 0.3);
  }
}

/** Moves the live motes: they float up, slow down and drift with the wind (wx, wz in m/s). */
export function stepRustle(pool: RustlePool, dt: number, wx = 0, wz = 0): void {
  const damp = Math.exp(-DRAG * dt);
  for (let i = 0; i < pool.size; i++) {
    if (pool.age[i] >= RUSTLE_LIFE) continue;
    pool.age[i] += dt;
    const v = i * 3;
    pool.velocity[v] = wx + (pool.velocity[v] - wx) * damp;
    pool.velocity[v + 1] = pool.velocity[v + 1] * damp - GRAVITY * dt * 0.3;
    pool.velocity[v + 2] = wz + (pool.velocity[v + 2] - wz) * damp;
    for (let a = 0; a < 3; a++) pool.position[v + a] += pool.velocity[v + a] * dt;
  }
}

/** Size factor of mote `i`: pops in, then shrinks away; 0 when free. */
export function rustleSize(pool: RustlePool, i: number): number {
  const t = pool.age[i] / RUSTLE_LIFE;
  if (t >= 0.999) return 0;
  return Math.min(t * 8, 1) * (1 - t);
}
