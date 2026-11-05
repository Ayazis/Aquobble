import type { Footprint } from './Footprint';

/**
 * A building plot or prop point in town-local metres (origin = centre of the square).
 * `assetId` names the model that will replace the grey box later.
 */
export interface TownPlot {
  assetId: string;
  x: number;
  z: number;
  /** Yaw in radians around +y. */
  rotation: number;
  footprint: Footprint;
}
