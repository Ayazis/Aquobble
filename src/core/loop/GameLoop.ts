import type { System } from '../ecs/System';
import type { FrameScheduler } from './FrameScheduler';
import type { GameLoopOptions } from './GameLoopOptions';

/**
 * Fixed-timestep game loop: simulation runs at a constant rate (stable physics), presentation runs
 * once per rendered frame. See https://gafferongames.com/post/fix_your_timestep/
 */
export class GameLoop {
  private readonly fixedSystems: readonly System[];
  private readonly frameSystems: readonly System[];
  private readonly fixedDt: number;
  private readonly maxSteps: number;
  private accumulator = 0;
  private lastTimeMs: number | null = null;
  private frameId: number | null = null;

  constructor(
    private readonly scheduler: FrameScheduler,
    options: GameLoopOptions,
  ) {
    this.fixedSystems = options.fixedSystems;
    this.frameSystems = options.frameSystems;
    this.fixedDt = options.fixedDt ?? 1 / 60;
    this.maxSteps = options.maxStepsPerFrame ?? 5;
  }

  start(): void {
    if (this.frameId !== null) return;
    this.lastTimeMs = null;
    this.frameId = this.scheduler.request(this.onFrame);
  }

  stop(): void {
    if (this.frameId !== null) this.scheduler.cancel(this.frameId);
    this.frameId = null;
  }

  /** Advances the loop to `timeMs`. Public so tests can drive time directly. */
  tick(timeMs: number): void {
    const frameDt = this.lastTimeMs === null ? 0 : (timeMs - this.lastTimeMs) / 1000;
    this.lastTimeMs = timeMs;
    this.accumulator = Math.min(this.accumulator + frameDt, this.fixedDt * this.maxSteps);

    // Small epsilon so float rounding (0.04 - 0.01 - 0.01 ...) does not drop a step.
    while (this.accumulator >= this.fixedDt - 1e-9) {
      for (const system of this.fixedSystems) system.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }
    for (const system of this.frameSystems) system.update(frameDt);
  }

  private readonly onFrame = (timeMs: number): void => {
    this.tick(timeMs);
    this.frameId = this.scheduler.request(this.onFrame);
  };
}
