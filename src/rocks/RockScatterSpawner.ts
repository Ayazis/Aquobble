import * as THREE from 'three';
import { identityQuat, vec3, type GameWorld } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import type { RockScatterFactory } from './RockScatterFactory';
import type { RockScatterOptions, RockScatterPlacer } from './RockScatterPlacer';

export interface RockScatterSpawnOptions extends RockScatterOptions {
  /** Rocks at least this big (scale, metres) get a fixed convex-hull collider; smaller ones are visual only. */
  colliderMinScale: number;
}

/** Places static decorative rocks: one instanced render entity plus fixed colliders for the big ones. */
export class RockScatterSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly placer: RockScatterPlacer,
    private readonly factory: RockScatterFactory,
    private readonly physics: PhysicsEngine,
  ) {}

  spawn(options: RockScatterSpawnOptions): void {
    const placements = this.placer.place(options);
    const { object, hulls } = this.factory.create(placements, options.variants);
    const euler = new THREE.Euler();
    for (const p of placements) {
      if (p.scale < options.colliderMinScale) continue;
      const unit = hulls[p.variant];
      const points = new Float32Array(unit.length);
      for (let i = 0; i < unit.length; i += 3) {
        points[i] = unit[i] * p.scale;
        points[i + 1] = unit[i + 1] * p.scale * p.squash;
        points[i + 2] = unit[i + 2] * p.scale;
      }
      const q = new THREE.Quaternion().setFromEuler(euler.set(p.tilt, p.yaw, 0, 'YXZ'));
      this.physics.createBody({
        kind: 'fixed',
        position: vec3(p.x, p.y, p.z),
        rotation: { x: q.x, y: q.y, z: q.z, w: q.w },
        shape: { type: 'convexHull', points },
        friction: 0.9,
      });
    }
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      renderObject: { object },
    });
  }
}
