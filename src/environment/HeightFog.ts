/**
 * Lane D2: live fog controls on top of the day cycle's fog. The weather lane sets `mist` (0 = clear, 1 = thick
 * sea mist); `DayNightSystem` folds it into the scene fog every frame.
 */
export class HeightFog {
  /** 0..1 extra mist; 1 makes the fog five times as dense. */
  mist = 0;

  /** Density to use given the day cycle's density for this hour. */
  densityFor(base: number): number {
    return base * (1 + 4 * Math.min(1, Math.max(0, this.mist)));
  }
}
