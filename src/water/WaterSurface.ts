/** Animated water: `time` is advanced each frame by `WaterAnimationSystem` and read by the water shader. */
export interface WaterSurface {
  time: { value: number };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    waterSurface?: WaterSurface;
  }
}
