import type { PlacedTown } from './PlacedTown';
import type { PlotSpawner } from './render/PlotSpawner';

/** Spawns every prop point through a `PlotSpawner` (model, or grey box as fallback). */
export class PropSpawner {
  constructor(private readonly boxes: PlotSpawner) {}

  spawn(town: PlacedTown): void {
    for (const prop of town.props) this.boxes.spawn(prop);
  }
}
