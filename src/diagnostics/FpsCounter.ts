/** Frame-rate statistics over a rolling time window. Pure: feed it frame deltas. */
export class FpsCounter {
  private frames = 0;
  private elapsed = 0;
  private worstFrame = 0;
  fps = 0;
  /** Slowest frame in the last window, in milliseconds. Spikes show up here before they show in the average. */
  worstFrameMs = 0;

  constructor(private readonly windowSeconds = 0.5) {}

  /** Records one frame. Returns true when the stats were refreshed. */
  sample(dt: number): boolean {
    if (dt <= 0) return false;
    this.frames++;
    this.elapsed += dt;
    this.worstFrame = Math.max(this.worstFrame, dt);
    if (this.elapsed < this.windowSeconds) return false;

    this.fps = this.frames / this.elapsed;
    this.worstFrameMs = this.worstFrame * 1000;
    this.frames = 0;
    this.elapsed = 0;
    this.worstFrame = 0;
    return true;
  }
}
