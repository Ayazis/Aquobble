import type { PlacedTown } from './PlacedTown';
import type { PlotSpawner } from './render/PlotSpawner';

/** Spawns every building plot through a `PlotSpawner` (model, or grey box as fallback). */
export class BuildingSpawner {
  constructor(private readonly boxes: PlotSpawner) {}

  spawn(town: PlacedTown): void {
    for (const building of town.buildings) this.boxes.spawn(building);
  }
}
