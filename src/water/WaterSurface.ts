/** Animated water: written each frame by `WaterAnimationSystem` and read by the water shader. */
export interface WaterSurface {
  time: { value: number };
  /** 0 by day, 1 at full night: dims the water and its foam so the sea does not outshine the land. */
  night: { value: number };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    waterSurface?: WaterSurface;
  }
}
