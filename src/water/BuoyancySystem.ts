import type { GameWorld, Quat, System, Vec3 } from '@core';
import type { PhysicsEngine } from '@physics';
import type { Buoyant } from './Buoyant';
import type { WaterLevel } from './WaterLevel';

const GRAVITY = 9.81;
/** Water density in the engine's density units (rocks are 2.5, driftwood about 0.6). */
const WATER_DENSITY = 1;

/**
 * Fixed system (before the physics step): pushes every buoyant body up at each of its sample points by the
 * water displaced there, and drags each point through the water. Pushing at the points (not the centre)
 * tilts bodies with the waves and lets them settle level. Light bodies float, dense ones sink slowly.
 */
export class BuoyancySystem implements System {
  private readonly bodies;
  private readonly point = { x: 0, y: 0, z: 0 };

  constructor(
    world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly water: WaterLevel,
  ) {
    this.bodies = world.with('buoyant', 'physicsBody', 'transform');
  }

  update(dt: number): void {
    if (dt <= 0) return;
    for (const { buoyant, physicsBody, transform } of this.bodies) {
      const previous = (buoyant.previous ??= []);
      const share = (WATER_DENSITY * buoyant.volume) / buoyant.points.length;
      buoyant.points.forEach((local, i) => {
        const p = rotate(transform.rotation, local, transform.position, this.point);
        const fresh = previous.length < i * 3 + 3;
        const vx = fresh ? 0 : (p.x - previous[i * 3]) / dt;
        const vy = fresh ? 0 : (p.y - previous[i * 3 + 1]) / dt;
        const vz = fresh ? 0 : (p.z - previous[i * 3 + 2]) / dt;
        previous[i * 3] = p.x;
        previous[i * 3 + 1] = p.y;
        previous[i * 3 + 2] = p.z;
        const under = submerged(buoyant, p, this.water);
        if (under <= 0) return;
        const water = share * under;
        const drag = water * buoyant.drag * dt;
        const impulse = { x: -vx * drag, y: GRAVITY * water * dt - vy * drag, z: -vz * drag };
        this.physics.applyImpulseAt(physicsBody.handle, impulse, p);
      });
    }
  }
}

/** Fraction in [0, 1] of the body's height under water at world point p. */
function submerged(buoyant: Buoyant, p: Vec3, water: WaterLevel): number {
  const surface = water.surfaceAt(p.x, p.z);
  if (surface <= water.groundAt(p.x, p.z)) return 0;
  const h = buoyant.halfHeight;
  return Math.min(1, Math.max(0, (surface - (p.y - h)) / (2 * h)));
}

/** out = q * v + offset (rotate a body-space point into the world). */
function rotate(q: Quat, v: Vec3, offset: Vec3, out: Vec3): Vec3 {
  const tx = 2 * (q.y * v.z - q.z * v.y);
  const ty = 2 * (q.z * v.x - q.x * v.z);
  const tz = 2 * (q.x * v.y - q.y * v.x);
  out.x = offset.x + v.x + q.w * tx + (q.y * tz - q.z * ty);
  out.y = offset.y + v.y + q.w * ty + (q.z * tx - q.x * tz);
  out.z = offset.z + v.z + q.w * tz + (q.x * ty - q.y * tx);
  return out;
}
