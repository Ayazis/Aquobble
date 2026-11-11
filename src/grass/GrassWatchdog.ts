/** Seconds of frames averaged before each verdict. */
const WINDOW = 3;
/** Share of tufts dropped per step, and the least kept. */
const STEP = 0.15;
const FLOOR = 0.4;

/**
 * Frame-time watchdog: when the average frame over a window is slower than `targetFps`, drops one step of
 * grass density. Never raises it again, so it settles instead of flickering.
 */
export class GrassWatchdog {
  private time = 0;
  private frames = 0;

  constructor(private readonly targetFps = 50) {}

  /** Feeds one frame; returns the new keep share given the current one. */
  update(dt: number, keep: number): number {
    // Ignore hitches (tab switches, loading) that are not about rendering cost.
    if (dt <= 0 || dt > 0.5) return keep;
    this.time += dt;
    this.frames++;
    if (this.time < WINDOW) return keep;
    const fps = this.frames / this.time;
    this.time = 0;
    this.frames = 0;
    return fps < this.targetFps ? Math.max(FLOOR, keep - STEP) : keep;
  }
}
