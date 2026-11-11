/**
 * Component: where tall grass (seed heads and reeds) stands, as the set of occupied grid cells, so effects
 * can ask "is this spot in tall grass?" without touching the GPU. Data only; query with `inTallGrass`.
 */
export interface TallGrassCover {
  /** Cell side in metres. */
  cell: number;
  /** Keys `${ix},${iz}` of cells holding at least one tall tuft. */
  cells: Set<string>;
}

/** Builds the cover from tuft positions. */
export function tallGrassCover(points: Iterable<{ x: number; z: number }>, cell = 1.5): TallGrassCover {
  const cells = new Set<string>();
  for (const p of points) cells.add(`${Math.floor(p.x / cell)},${Math.floor(p.z / cell)}`);
  return { cell, cells };
}

/** True when (x, z) is in a cell with tall grass. */
export function inTallGrass(cover: TallGrassCover, x: number, z: number): boolean {
  return cover.cells.has(`${Math.floor(x / cover.cell)},${Math.floor(z / cover.cell)}`);
}

declare module '@core/ecs/Entity' {
  interface Entity {
    tallGrass?: TallGrassCover;
  }
}
