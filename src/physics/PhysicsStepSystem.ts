import type { System } from '@core';
import type { PhysicsEngine } from './PhysicsEngine';

/** Fixed system: advances the physics simulation by one step. */
export class PhysicsStepSystem implements System {
  constructor(private readonly engine: PhysicsEngine) {}

  update(dt: number): void {
    this.engine.step(dt);
  }
}
