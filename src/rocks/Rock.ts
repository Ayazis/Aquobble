/** Component (tag): marks an entity as a loose physics rock. */
export interface Rock {
  radius: number;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    rock?: Rock;
  }
}
