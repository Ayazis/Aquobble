import { vec3 } from '@core';
import type { TownWall, WallSide } from '../layout/TownWall';
import type { Box } from './Box';

const SIDES: Record<WallSide, { alongX: boolean; sign: number }> = {
  north: { alongX: true, sign: 1 },
  south: { alongX: true, sign: -1 },
  east: { alongX: false, sign: 1 },
  west: { alongX: false, sign: -1 },
};

const TOWER = 3;

/** Breaks the wall into boxes (town-local, y = 0 at the ground): segments, corner towers, gatehouses. */
export function wallBoxes(wall: TownWall): Box[] {
  const { halfSize, thickness, height } = wall;
  const boxes: Box[] = [];
  const box = (along: number, alongHalf: number, y: number, yHalf: number, acrossHalf: number, side: WallSide) => {
    const { alongX, sign } = SIDES[side];
    const across = sign * halfSize;
    boxes.push(
      alongX
        ? { center: vec3(along, y, across), half: vec3(alongHalf, yHalf, acrossHalf) }
        : { center: vec3(across, y, along), half: vec3(acrossHalf, yHalf, alongHalf) },
    );
  };

  for (const side of Object.keys(SIDES) as WallSide[]) {
    const gate = wall.gates.find((g) => g.side === side);
    const gap = gate ? gate.width / 2 : 0;
    const end = halfSize;
    const length = end - gap;
    if (gate) {
      box(-(gap + end) / 2, length / 2, height / 2, height / 2, thickness / 2, side);
      box((gap + end) / 2, length / 2, height / 2, height / 2, thickness / 2, side);
      // Gatehouse: two posts and a lintel high enough to walk under.
      const postH = height + 2;
      for (const s of [-1, 1]) box(s * (gap + TOWER / 2), TOWER / 2, postH / 2, postH / 2, TOWER / 2, side);
      box(0, gap, height + 1, 1, thickness / 2 + 0.2, side);
    } else {
      box(0, end, height / 2, height / 2, thickness / 2, side);
    }
  }
  const cornerH = height + 1.5;
  for (const x of [-halfSize, halfSize]) {
    for (const z of [-halfSize, halfSize]) {
      boxes.push({ center: vec3(x, cornerH / 2, z), half: vec3(TOWER / 2, cornerH / 2, TOWER / 2) });
    }
  }
  return boxes;
}
