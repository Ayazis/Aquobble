import type { NavPoint } from '@navigation';

/** Component: a wandering townsperson's tuning and wander state. */
export interface Townsfolk {
  walkSpeed: number;
  /** Seconds to stand still at each target, picked between these. */
  minIdle: number;
  maxIdle: number;
  /** Close enough to a waypoint to count as reached (m). */
  arriveDistance: number;
  state: 'walking' | 'idle';
  /** Waypoints of the current walk; the last one is the target. */
  path: NavPoint[];
  /** Index in `path` of the waypoint being walked to. */
  waypoint: number;
  /** Seconds left standing still (idle only). */
  timer: number;
  /** Where it stood at the last progress check, and the seconds since. */
  checkX: number;
  checkZ: number;
  sinceCheck: number;
  /** Progress checks failed in a row on this walk. */
  stalls: number;
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
    arriveDistance: 0.3,
    state: 'idle',
    path: [],
    waypoint: 0,
    timer: idle,
    checkX: 0,
    checkZ: 0,
    sinceCheck: 0,
    stalls: 0,
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
