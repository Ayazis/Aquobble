export interface SmoothZoomOptions {
  minDistance: number;
  maxDistance: number;
  /** How fast the distance catches up with the target; higher is snappier. Frame-rate independent. */
  responsiveness: number;
  /** Zoom change per wheel pixel (exponential, so zooming feels the same near and far). */
  wheelSensitivity: number;
}

export const DEFAULT_SMOOTH_ZOOM: SmoothZoomOptions = {
  minDistance: 8,
  maxDistance: 400,
  responsiveness: 10,
  wheelSensitivity: 0.0015,
};

/**
 * Eases camera distance toward a target instead of jumping per wheel notch. Pure math, no DOM.
 * While idle it follows the real distance, so other zoom sources (pinch) don't fight it.
 */
export class SmoothZoom {
  private current: number | null = null;
  private target = 0;

  constructor(private readonly options: SmoothZoomOptions = DEFAULT_SMOOTH_ZOOM) {}

  get isAnimating(): boolean {
    return this.current !== null && Math.abs(this.target - this.current) > 1e-3 * this.target;
  }

  /** Adds a wheel delta in pixels. Positive zooms out. */
  addWheel(deltaPixels: number): void {
    if (this.current === null) return;
    const base = this.isAnimating ? this.target : this.current;
    this.target = this.clamp(base * Math.exp(deltaPixels * this.options.wheelSensitivity));
  }

  /** Advances the easing. `actualDistance` is the camera's real distance this frame. Returns the distance to use. */
  update(dt: number, actualDistance: number): number {
    if (this.current === null || !this.isAnimating) {
      this.current = this.target = actualDistance;
      return actualDistance;
    }
    const blend = 1 - Math.exp(-this.options.responsiveness * dt);
    this.current += (this.target - this.current) * blend;
    return this.current;
  }

  private clamp(distance: number): number {
    return Math.min(Math.max(distance, this.options.minDistance), this.options.maxDistance);
  }
}
