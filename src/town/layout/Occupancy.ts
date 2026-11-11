import { plotRect, rectCorners, rectsOverlap, type GroundRect } from './GroundRect';
import type { TownPlot } from './TownPlot';

/**
 * The ground already taken while the town is laid out: solid things (roads, plots) nothing may overlap, and
 * keep-clear zones (in front of doors) that only props must avoid. Everything stays inside the wall.
 */
export class Occupancy {
  private readonly solids: GroundRect[] = [];
  private readonly clear: GroundRect[] = [];

  /** `inner`: distance from the centre to the inside face of the wall. */
  constructor(private readonly inner: number) {}

  block(rect: GroundRect): void {
    this.solids.push(rect);
  }

  keepClear(rect: GroundRect): void {
    this.clear.push(rect);
  }

  /** True when the plot stands inside the wall on free ground; buildings pass `prop = false` to ignore doors. */
  fits(plot: TownPlot, prop = true): boolean {
    const rect = plotRect(plot);
    if (rectCorners(rect).some((c) => Math.abs(c.x) > this.inner || Math.abs(c.z) > this.inner)) return false;
    if (this.solids.some((s) => rectsOverlap(s, rect))) return false;
    return !prop || !this.clear.some((s) => rectsOverlap(s, rect));
  }

  /** Places the plot if it fits; returns whether it did. */
  take(plot: TownPlot, prop = true): boolean {
    if (!this.fits(plot, prop)) return false;
    this.solids.push(plotRect(plot));
    return true;
  }
}
