import type { Entity, GameWorld, System, Transform } from '@core';
import type {} from '@physics';
import type {} from '@player';
import type {} from '@rocks';
import type { BendMap } from './BendMap';
import { stampStrength, type BendStamp } from './BendStamp';
import { grassImpact } from './grassImpact';

/** Rocks stamp only while rolling along, not while falling (a falling rock has a big vertical speed). */
const ROCK_MIN_SPEED = 0.5;
const ROCK_MAX_FALL = 3;

/**
 * Presses every walking character and rolling rock into the bend map as a soft disc pushed along its
 * velocity, and every landing (a jump coming down, a rock hitting the ground) as an impact that splays the
 * grass outwards, then steps the map over a box centred on the player (frame system, before the render).
 */
export class GrassBendSystem implements System {
  private readonly characters;
  private readonly rocks;
  private readonly players;
  private readonly last = new WeakMap<Entity, { x: number; y: number; z: number; vy: number }>();

  constructor(
    world: GameWorld,
    private readonly map: BendMap,
    private readonly radius = 0.9,
  ) {
    this.characters = world.with('characterBody', 'transform');
    this.rocks = world.with('rock', 'transform');
    this.players = world.with('player', 'transform');
  }

  update(dt: number): void {
    const stamps: BendStamp[] = [];
    // Only the feet's footprint, not the body's whole bend radius: a wide disc reads as an aura.
    for (const e of this.characters) this.stamp(e, dt, this.radius * 0.55, stamps, false);
    for (const e of this.rocks) this.stamp(e, dt, this.radius * 0.8, stamps, true);
    const focus = this.players.first ?? this.characters.first;
    if (!focus) return;
    stamps.sort((a, b) => dist2(a, focus.transform.position) - dist2(b, focus.transform.position));
    this.map.step(dt, focus.transform.position.x, focus.transform.position.z, stamps);
  }

  private stamp(e: Entity & { transform: Transform }, dt: number, radius: number, out: BendStamp[], rock: boolean) {
    const p = e.transform.position;
    const prev = this.last.get(e);
    const inv = prev && dt > 0 ? 1 / dt : 0;
    const from = prev ?? { ...p, vy: 0 };
    const [vx, vy, vz] = [(p.x - from.x) * inv, (p.y - from.y) * inv, (p.z - from.z) * inv];
    this.last.set(e, { x: p.x, y: p.y, z: p.z, vy });
    const speed = Math.hypot(vx, vz);
    // Teleports (respawn, recycled rocks) read as huge speeds: skip that frame.
    if (speed > 40 || Math.abs(vy) > 60) return;
    const impact = grassImpact(p.x, p.z, from.vy, vy, radius);
    if (impact) out.push(impact);
    if (rock && (Math.hypot(speed, vy) < ROCK_MIN_SPEED || Math.abs(vy) > ROCK_MAX_FALL)) return;
    out.push({ x: p.x, z: p.z, radius, strength: stampStrength(speed), vx, vz });
  }
}

function dist2(a: { x: number; z: number }, b: { x: number; z: number }): number {
  return (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
}
