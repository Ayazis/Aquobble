import type { Vec3 } from '@core';
import type { Flock } from './Flock';

const SEEK = 0.6;
const COHESION = 0.25;
const SEPARATION = 6;
const SEPARATION_RADIUS = 2.5;
const HEIGHT_PUSH = 2;

/**
 * Boids-lite: each bird seeks the moving orbit target, drifts toward the flock centre, avoids close
 * neighbours and stays between min/max height. Speed is clamped to the flock's cruising speed.
 */
export function flockStep(flock: Flock, dt: number): void {
  flock.angle += flock.orbitSpeed * dt;
  const target: Vec3 = {
    x: flock.center.x + Math.cos(flock.angle) * flock.radius,
    y: flock.center.y,
    z: flock.center.z + Math.sin(flock.angle) * flock.radius,
  };
  const centroid = average(flock.birds.map((b) => b.position));

  for (const bird of flock.birds) {
    const p = bird.position;
    let ax = (target.x - p.x) * SEEK + (centroid.x - p.x) * COHESION;
    let ay = (target.y - p.y) * SEEK + (centroid.y - p.y) * COHESION;
    let az = (target.z - p.z) * SEEK + (centroid.z - p.z) * COHESION;

    for (const other of flock.birds) {
      if (other === bird) continue;
      const dx = p.x - other.position.x;
      const dy = p.y - other.position.y;
      const dz = p.z - other.position.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > SEPARATION_RADIUS * SEPARATION_RADIUS || d2 === 0) continue;
      const push = SEPARATION / d2;
      ax += dx * push;
      ay += dy * push;
      az += dz * push;
    }
    if (p.y < flock.minHeight) ay += (flock.minHeight - p.y) * HEIGHT_PUSH;
    if (p.y > flock.maxHeight) ay -= (p.y - flock.maxHeight) * HEIGHT_PUSH;

    const v = bird.velocity;
    v.x += ax * dt;
    v.y += ay * dt * 0.5;
    v.z += az * dt;
    clampSpeed(v, flock.speed);
    p.x += v.x * dt;
    p.y += v.y * dt;
    p.z += v.z * dt;
  }
}

function average(points: Vec3[]): Vec3 {
  const sum = { x: 0, y: 0, z: 0 };
  for (const p of points) {
    sum.x += p.x;
    sum.y += p.y;
    sum.z += p.z;
  }
  const n = Math.max(points.length, 1);
  return { x: sum.x / n, y: sum.y / n, z: sum.z / n };
}

function clampSpeed(v: Vec3, max: number): void {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len <= max || len === 0) return;
  const k = max / len;
  v.x *= k;
  v.y *= k;
  v.z *= k;
}
