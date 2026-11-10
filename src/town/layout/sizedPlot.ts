import { TOWN_ASSET_SIZES, type TownAssetId } from './townAssetSizes';
import type { TownPlot } from './TownPlot';

/** A plot for `assetId` at its true size; `rotation` 0 faces +z. */
export function sizedPlot(assetId: TownAssetId, x: number, z: number, rotation = 0): TownPlot {
  return { assetId, x, z, rotation, footprint: TOWN_ASSET_SIZES[assetId] };
}
