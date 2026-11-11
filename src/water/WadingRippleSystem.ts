import type { Entity, GameWorld, System, Vec3 } from '@core';
import type {} from '@physics';
import type {} from '@player';
import { footfall } from './footfall';
import type { RippleStamper } from './RippleStamper';
import type { WaterContact } from './WaterContact';
import type { WaterEventBus } from './WaterEventBus';

const STEP = 1 / 60;
const ANKLE = 0.12;
const IDLE_RING_SECONDS = 2.5;
const STROKE_SECONDS = 1.1;

interface Gait {
  phase: number;
  idle: number;
  stroke: number;
}

/**
 * Fixed system: what characters (player and wading villagers) do to the water as they move.
 * Footstep rings timed from the walk/run clip (2.8), a faint ring now and then when standing, a
 * continuous wake and bow foam past the ankle (2.9, wider when swimming) and swim strokes (2.13).
 */
export class WadingRippleSystem implements System {
  private readonly characters;
  private readonly gaits = new WeakMap<Entity, Gait>();

  constructor(
    world: GameWorld,
    private readonly ripples: RippleStamper,
    private readonly events: WaterEventBus,
  ) {
    this.characters = world.with('waterContact', 'transform', 'characterBody');
  }

  update(dt: number = STEP): void {
    for (const entity of this.characters) {
      const c = entity.waterContact;
      if (!c.inWater) continue;
      const gait = this.gaits.get(entity) ?? { phase: 0, idle: 0, stroke: 0 };
      this.gaits.set(entity, gait);
      const p = entity.transform.position;
      if (entity.player?.swimming) this.swim(p, c, gait, dt);
      else this.wade(entity, p, c, gait, dt);
      this.wake(c, p, entity.player?.swimming === true);
    }
  }

  private wade(entity: Entity, p: Vec3, c: WaterContact, gait: Gait, dt: number): void {
    const { x, z } = p;
    const anim = entity.characterAnimation;
    if (!anim || c.speed <= 0.3 || anim.current === 'idle') {
      gait.idle += dt;
      if (gait.idle > IDLE_RING_SECONDS) {
        gait.idle = 0;
        this.ripples.stamp(x, z, 0.45, 0.08);
      }
      return;
    }
    gait.idle = 0;
    const action = anim.actions[anim.current];
    const duration = action.getClip().duration || 1;
    const phase = (action.time / duration) % 1;
    const foot = footfall(gait.phase, phase);
    gait.phase = phase;
    if (foot === 0) return;
    const run = anim.current === 'run';
    const facing = anim.facing.rotation.y;
    const side = foot * 0.12;
    const fx = x + Math.cos(facing) * side;
    const fz = z - Math.sin(facing) * side;
    const strength = Math.min(1, (run ? 0.6 : 0.38) * (1 + c.speed * 0.1));
    this.ripples.stamp(fx, fz, run ? 0.55 : 0.42, strength, run ? 0.65 : 0.4);
    this.events.emit({ type: 'footstep', x: fx, y: p.y - c.bottom, z: fz, strength });
  }

  private swim(p: Vec3, c: WaterContact, gait: Gait, dt: number): void {
    if (c.speed < 0.3) return;
    gait.stroke += dt;
    if (gait.stroke < STROKE_SECONDS) return;
    gait.stroke = 0;
    const { x, z } = p;
    this.ripples.stamp(x, z, 0.9, 0.4, 0.6);
    this.events.emit({ type: 'swimStroke', x, y: c.surfaceY, z });
  }

  /** A moving source in a wave field leaves its own V; the bow gets a little foam ahead of the legs. */
  private wake(c: WaterContact, p: { x: number; z: number }, swimming: boolean): void {
    if (c.immersion < ANKLE || c.speed < 0.4) return;
    const strength = Math.min(0.12, 0.016 * c.speed) * (swimming ? 1.5 : 1);
    // The trail: foam laid where the legs (or body) cut through, left behind as a white wake.
    this.ripples.stamp(p.x, p.z, swimming ? 0.8 : 0.5, strength, Math.min(0.7, 0.25 + c.speed * 0.12));
    const dx = p.x - c.lastX;
    const dz = p.z - c.lastZ;
    const len = Math.hypot(dx, dz);
    // Runs after the physics pose: lastX is where the character was before this step's move.
    if (len < 1e-4) return;
    const ahead = 0.35 / len;
    this.ripples.stamp(p.x + dx * ahead, p.z + dz * ahead, 0.4, 0, Math.min(1, c.speed * 0.25));
  }
}
