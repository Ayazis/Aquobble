import type { System } from '../ecs/System';

export interface GameLoopOptions {
  /** Deterministic simulation (physics, game rules). Runs at a fixed rate. */
  fixedSystems: readonly System[];
  /** Presentation (sync to three.js, camera, render). Runs once per frame. */
  frameSystems: readonly System[];
  /** Simulation step in seconds. Default 1/60. */
  fixedDt?: number;
  /** Max simulation steps per frame; prevents a death spiral after a stall. Default 5. */
  maxStepsPerFrame?: number;
}
