/** Component: a wandering townsperson's tuning and wander state. */
export interface Townsfolk {
  walkSpeed: number;
  /** Seconds to stand still at each target, picked between these. */
  minIdle: number;
  maxIdle: number;
  /** Close enough to the target to stop (m). */
  arriveDistance: number;
  state: 'walking' | 'idle';
  targetX: number;
  targetZ: number;
  /** Seconds left standing still (idle) or before giving up on the target (walking). */
  timer: number;
  verticalVelocity: number;
  /** Horizontal velocity of the last move (m/s), read by presentation to animate and face the model. */
  moveX: number;
  moveZ: number;
  grounded: boolean;
}

/** A townsperson that starts idle for `idle` seconds before picking its first target. */
export function createTownsfolk(walkSpeed: number, idle: number): Townsfolk {
  return {
    walkSpeed,
    minIdle: 2,
    maxIdle: 6,
    arriveDistance: 0.5,
    state: 'idle',
    targetX: 0,
    targetZ: 0,
    timer: idle,
    verticalVelocity: 0,
    moveX: 0,
    moveZ: 0,
    grounded: false,
  };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    townsfolk?: Townsfolk;
  }
}
