import type { Random, Vec3 } from '@core';
import type { Flock } from './Flock';

export interface FlockOptions {
  count: number;
  center: Vec3;
  radius: number;
  minHeight: number;
  maxHeight: number;
}

/** Builds a flock bunched up at a random point on its orbit, all heading the same way. */
export function createFlock(random: Random, options: FlockOptions): Flock {
  const angle = random.range(0, Math.PI * 2);
  const direction = random.next() < 0.5 ? -1 : 1;
  const speed = random.range(7, 11);
  const orbitSpeed = (direction * speed * 0.8) / options.radius;
  const start = {
    x: options.center.x + Math.cos(angle) * options.radius,
    z: options.center.z + Math.sin(angle) * options.radius,
  };
  const birds = Array.from({ length: options.count }, () => ({
    position: {
      x: start.x + random.range(-4, 4),
      y: options.center.y + random.range(-3, 3),
      z: start.z + random.range(-4, 4),
    },
    velocity: { x: -Math.sin(angle) * direction * speed, y: 0, z: Math.cos(angle) * direction * speed },
    flapPhase: random.range(0, Math.PI * 2),
  }));
  return {
    birds,
    center: { ...options.center },
    radius: options.radius,
    orbitSpeed,
    angle,
    speed,
    minHeight: options.minHeight,
    maxHeight: options.maxHeight,
  };
}
