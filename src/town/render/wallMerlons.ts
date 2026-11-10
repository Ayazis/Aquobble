import { vec3 } from '@core';
import type { TownWall } from '../layout/TownWall';
import type { Box } from './Box';

const WIDTH = 0.9;
const HEIGHT = 0.7;
const SPACING = 1.8;

/** The teeth along the top of the wall's four sides (town-local, y = 0 at the ground), skipping the gates. */
export function wallMerlons(wall: TownWall): Box[] {
  const { halfSize, thickness, height } = wall;
  const merlons: Box[] = [];
  const y = height + HEIGHT / 2;
  for (const side of ['north', 'south', 'east', 'west'] as const) {
    const gate = wall.gates.find((g) => g.side === side);
    // Keep clear of the gatehouse posts, which stand taller than the wall.
    const gap = gate ? gate.width / 2 + 3.4 : 0;
    const sign = side === 'north' || side === 'east' ? 1 : -1;
    for (let along = -halfSize + SPACING * 1.5; along < halfSize - SPACING; along += SPACING) {
      if (Math.abs(along) < gap) continue;
      const alongX = side === 'north' || side === 'south';
      merlons.push({
        center: alongX ? vec3(along, y, sign * halfSize) : vec3(sign * halfSize, y, along),
        half: alongX ? vec3(WIDTH / 2, HEIGHT / 2, thickness / 2) : vec3(thickness / 2, HEIGHT / 2, WIDTH / 2),
      });
    }
  }
  return merlons;
}
