import type { PlacedPlot } from '../PlacedTown';

/** Puts one plot (building or prop) into the world. */
export interface PlotSpawner {
  spawn(placed: PlacedPlot): void;
}
