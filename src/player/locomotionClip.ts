import type { LocomotionClip } from './CharacterAnimation';

/** Picks idle/walk/run from horizontal speed: walk above a small dead zone, run past halfway to run speed. */
export function locomotionClip(speed: number, walkSpeed: number, runSpeed: number): LocomotionClip {
  if (speed < 0.1) return 'idle';
  return speed > (walkSpeed + runSpeed) / 2 ? 'run' : 'walk';
}
