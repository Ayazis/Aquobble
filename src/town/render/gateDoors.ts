import { vec3 } from '@core';
import type { TownWall } from '../layout/TownWall';
import type { Box } from './Box';
import { gateArch } from './gateArch';

const LEAF = 0.12;
const STRAP = 0.06;
const STRAP_HEIGHTS = [0.55, 1.95];

/**
 * Two wooden door leaves per gate, swung fully open into the town against the passage sides, so the way through
 * stays clear. Town-local boxes, visual only.
 */
export function gateDoors(wall: TownWall): { wood: Box[]; iron: Box[] } {
  const wood: Box[] = [];
  const iron: Box[] = [];
  for (const gate of wall.gates) {
    const arch = gateArch(wall, gate);
    const alongX = gate.side === 'north' || gate.side === 'south';
    const sign = gate.side === 'north' || gate.side === 'east' ? 1 : -1;
    const length = arch.halfSpan - 0.1;
    const leafH = arch.springing + 0.6;
    // From the inner face of the passage, inwards towards the town centre.
    const across = sign * (wall.halfSize - arch.depth / 2 - length / 2);
    const put = (list: Box[], along: number, y: number, alongHalf: number, yHalf: number) =>
      list.push(
        alongX
          ? { center: vec3(along, y, across), half: vec3(alongHalf, yHalf, length / 2) }
          : { center: vec3(across, y, along), half: vec3(length / 2, yHalf, alongHalf) },
      );
    for (const s of [-1, 1]) {
      const along = s * (arch.halfSpan - LEAF / 2 - 0.02);
      put(wood, along, leafH / 2, LEAF / 2, leafH / 2);
      for (const y of STRAP_HEIGHTS) put(iron, along, y, LEAF / 2 + STRAP / 2, STRAP);
    }
  }
  return { wood, iron };
}
