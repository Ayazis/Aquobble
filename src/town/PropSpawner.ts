import type { PlacedTown } from './PlacedTown';
import type { PlotBoxSpawner } from './render/PlotBoxSpawner';

/** Spawns a placeholder box + collider for every prop point. Swap for model loading later. */
export class PropSpawner {
  constructor(private readonly boxes: PlotBoxSpawner) {}

  spawn(town: PlacedTown): void {
    for (const prop of town.props) this.boxes.spawn(prop);
  }
}
