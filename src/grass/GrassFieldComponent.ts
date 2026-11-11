/** Marks the grass field entity; `keep` is the share of tufts drawn (lowered by `GrassWatchdogSystem`). */
export interface GrassFieldComponent {
  keep: { value: number };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    grassField?: GrassFieldComponent;
  }
}
