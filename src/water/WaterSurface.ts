/** Animated water: shader uniforms; `time` is advanced each frame by `WaterAnimationSystem`. */
export interface WaterSurface {
  time: { value: number };
  /** Shader sun direction (unit vector); write into `.value` to follow a moving sun. */
  sunDirection: { value: { x: number; y: number; z: number } };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    waterSurface?: WaterSurface;
  }
}
