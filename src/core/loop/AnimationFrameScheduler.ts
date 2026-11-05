import type { FrameScheduler } from './FrameScheduler';

/** Browser frame scheduler backed by requestAnimationFrame. */
export class AnimationFrameScheduler implements FrameScheduler {
  request(callback: (timeMs: number) => void): number {
    return requestAnimationFrame(callback);
  }

  cancel(id: number): void {
    cancelAnimationFrame(id);
  }
}
