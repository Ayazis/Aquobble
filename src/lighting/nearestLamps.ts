import type { Vec3 } from '@core';
import type { LightSlot } from './LightSlot';

/**
 * Fills `slots` with the lamps nearest to `focus` (horizontal distance), nearest first, without allocating.
 * A lamp's weight falls from 1 to 0 over the last `blend` metres before the first lamp left without a light
 * becomes nearer than it; the lamp taking over starts at 0 at that same moment.
 */
export function nearestLamps(lamps: readonly Vec3[], focus: Vec3, blend: number, slots: LightSlot[]): void {
  let previousD = -1;
  let previousI = -1;
  // One extra pass finds the nearest lamp that gets no light: the cutoff the weights fade towards.
  for (let k = 0; k <= slots.length; k++) {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < lamps.length; i++) {
      const dx = lamps[i].x - focus.x;
      const dz = lamps[i].z - focus.z;
      const d = dx * dx + dz * dz;
      const after = d > previousD || (d === previousD && i > previousI);
      if (after && d < bestD) {
        best = i;
        bestD = d;
      }
    }
    previousD = bestD;
    previousI = best;
    if (k < slots.length) {
      slots[k].lamp = best;
      slots[k].weight = Math.sqrt(bestD); // distance for now; turned into a weight below
      continue;
    }
    const cutoff = Math.sqrt(bestD);
    for (const slot of slots) slot.weight = weightOf(slot, cutoff, blend);
  }
}

function weightOf(slot: LightSlot, cutoff: number, blend: number): number {
  if (slot.lamp < 0) return 0;
  if (cutoff === Infinity || blend <= 0) return 1;
  return Math.min(1, Math.max(0, (cutoff - slot.weight) / blend));
}
