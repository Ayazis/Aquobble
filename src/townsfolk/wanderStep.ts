import type { Random } from '@core';
import type { Navigator } from '@navigation';
import type { Townsfolk } from './Townsfolk';

/** Seconds between checks that a walker is still getting somewhere. */
const CHECK_SECONDS = 1;
/** A walker should cover at least this share of its walking speed between checks. */
const MIN_PROGRESS = 0.25;
/** Failed checks in a row before the walk is abandoned; each one before that plans a fresh route. */
const MAX_STALLS = 3;

/**
 * Advances the wander state machine by `dt` from position (x, z) and writes the horizontal velocity to
 * walk with into `folk.moveX/moveZ`: idle a few seconds, plan a route to a random spot, follow its
 * waypoints, repeat. A walker that stops making progress (someone in the way) re-plans, then gives up.
 */
export function wanderStep(
  folk: Townsfolk,
  x: number,
  z: number,
  dt: number,
  navigator: Navigator,
  random: Random,
): void {
  folk.moveX = 0;
  folk.moveZ = 0;
  if (folk.state === 'idle') {
    folk.timer -= dt;
    if (folk.timer > 0) return;
    const target = navigator.randomPoint(random);
    if (!startWalk(folk, x, z, target.x, target.z, navigator)) return rest(folk, random);
    folk.stalls = 0;
  }

  if (stalled(folk, x, z, dt)) {
    const target = folk.path[folk.path.length - 1];
    const giveUp = ++folk.stalls >= MAX_STALLS;
    if (giveUp || !startWalk(folk, x, z, target.x, target.z, navigator)) return rest(folk, random);
  }

  // Skip every waypoint already reached, then head for the next one.
  let next = folk.path[folk.waypoint];
  let distance = Math.hypot(next.x - x, next.z - z);
  while (distance <= folk.arriveDistance) {
    if (++folk.waypoint >= folk.path.length) return rest(folk, random);
    next = folk.path[folk.waypoint];
    distance = Math.hypot(next.x - x, next.z - z);
  }
  const scale = folk.walkSpeed / distance;
  folk.moveX = (next.x - x) * scale;
  folk.moveZ = (next.z - z) * scale;
}

/** Plans a route and switches to walking. False when there is none. */
function startWalk(folk: Townsfolk, x: number, z: number, toX: number, toZ: number, navigator: Navigator): boolean {
  const path = navigator.findPath(x, z, toX, toZ);
  if (!path || path.length === 0) return false;
  folk.state = 'walking';
  folk.path = path;
  folk.waypoint = 0;
  folk.checkX = x;
  folk.checkZ = z;
  folk.sinceCheck = 0;
  return true;
}

function rest(folk: Townsfolk, random: Random): void {
  folk.state = 'idle';
  folk.path = [];
  folk.waypoint = 0;
  folk.timer = random.range(folk.minIdle, folk.maxIdle);
}

/** True once per check interval in which the walker covered too little ground. */
function stalled(folk: Townsfolk, x: number, z: number, dt: number): boolean {
  folk.sinceCheck += dt;
  if (folk.sinceCheck < CHECK_SECONDS) return false;
  const moved = Math.hypot(x - folk.checkX, z - folk.checkZ);
  const expected = folk.walkSpeed * folk.sinceCheck;
  folk.checkX = x;
  folk.checkZ = z;
  folk.sinceCheck = 0;
  return moved < expected * MIN_PROGRESS;
}
