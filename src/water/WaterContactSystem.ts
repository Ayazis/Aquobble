import type { Entity, GameWorld, System } from '@core';
import type {} from '@physics';
import type {} from '@rocks';
import type {} from './Buoyant';
import { dryContact, type WaterContact } from './WaterContact';
import type { WaterLevel } from './WaterLevel';

/**
 * Fixed system: for every character, buoyant body and loose rock, works out whether it is in the water, how
 * deep, how fast it moves and whether it just went in or came out, and writes its `WaterContact`.
 * Run it before the movement and buoyancy systems; it reads the transforms of the previous step.
 */
export class WaterContactSystem implements System {
  private readonly groups;
  private readonly batch: Entity[] = [];

  constructor(
    private readonly world: GameWorld,
    private readonly water: WaterLevel,
  ) {
    this.groups = [
      world.with('transform', 'characterBody'),
      world.with('transform', 'buoyant'),
      world.with('transform', 'rock'),
    ];
  }

  update(dt: number): void {
    this.batch.length = 0;
    for (const group of this.groups) for (const entity of group) this.batch.push(entity);
    for (const entity of this.batch) {
      if (!entity.transform) continue;
      if (!entity.waterContact) {
        const contact = dryContact(defaultBottom(entity), entity.transform.position);
        this.world.addComponent(entity, 'waterContact', contact);
      }
      if (entity.waterContact) this.measure(entity.waterContact, entity.transform.position, dt);
    }
  }

  private measure(c: WaterContact, p: { x: number; y: number; z: number }, dt: number): void {
    const surface = this.water.surfaceAt(p.x, p.z);
    const depth = surface - this.water.groundAt(p.x, p.z);
    const immersion = surface - (p.y - c.bottom);
    const wet = depth > 0 && immersion > 0;
    c.entered = wet && !c.inWater;
    c.left = !wet && c.inWater;
    c.inWater = wet;
    c.surfaceY = surface;
    c.depth = depth;
    c.immersion = immersion;
    if (dt > 0) {
      c.speed = Math.hypot(p.x - c.lastX, p.z - c.lastZ) / dt;
      c.verticalSpeed = (p.y - c.lastY) / dt;
    }
    c.lastX = p.x;
    c.lastY = p.y;
    c.lastZ = p.z;
  }
}

function defaultBottom(entity: Entity): number {
  if (entity.buoyant) return entity.buoyant.halfHeight;
  if (entity.rock) return entity.rock.radius;
  return 0;
}
