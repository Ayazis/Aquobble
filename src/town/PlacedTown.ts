import type { Vec3 } from '@core';
import type { TownLayout } from './layout/TownLayout';
import type { TownPlot } from './layout/TownPlot';

/** A plot with its world position (y = ground height under its centre). */
export interface PlacedPlot {
  plot: TownPlot;
  position: Vec3;
}

/** A town layout resolved onto the terrain. Roads and wall stay town-local, relative to `origin`. */
export interface PlacedTown {
  layout: TownLayout;
  origin: Vec3;
  buildings: PlacedPlot[];
  props: PlacedPlot[];
}
