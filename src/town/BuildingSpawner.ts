import type { PlacedTown } from './PlacedTown';
import type { PlotBoxSpawner } from './render/PlotBoxSpawner';

/** Spawns a placeholder box + collider for every building plot. Swap for model loading later. */
export class BuildingSpawner {
  constructor(private readonly boxes: PlotBoxSpawner) {}

  spawn(town: PlacedTown): void {
    for (const building of town.buildings) this.boxes.spawn(building);
  }
}
