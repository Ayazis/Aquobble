/** A unit of behaviour that runs every tick over a query of entities. One job per system. */
export interface System {
  update(dt: number): void;
}
