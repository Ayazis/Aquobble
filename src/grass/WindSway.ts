/** Shared shader uniform for swaying plants; `WindSwaySystem` advances the time. */
export interface WindSway {
  time: { value: number };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    windSway?: WindSway;
  }
}
