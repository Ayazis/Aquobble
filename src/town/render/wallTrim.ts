import { vec3 } from '@core';
import type { Box } from './Box';

const PLINTH_HEIGHT = 0.55;
const PLINTH_OUT = 0.22;
const CAP_HEIGHT = 0.22;
const CAP_OUT = 0.14;

/** A plinth at the foot and a cap course on top of every box that stands on the ground (segments, towers, posts). */
export function wallTrim(boxes: Box[]): { plinths: Box[]; caps: Box[] } {
  const grounded = boxes.filter((b) => Math.abs(b.center.y - b.half.y) < 1e-6);
  return {
    plinths: grounded.map(({ center, half }) => ({
      center: vec3(center.x, PLINTH_HEIGHT / 2, center.z),
      half: vec3(half.x + PLINTH_OUT, PLINTH_HEIGHT / 2, half.z + PLINTH_OUT),
    })),
    caps: grounded.map(({ center, half }) => ({
      center: vec3(center.x, center.y + half.y, center.z),
      half: vec3(half.x + CAP_OUT, CAP_HEIGHT / 2, half.z + CAP_OUT),
    })),
  };
}
