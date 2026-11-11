import type { Random } from '@core';
import type { Occupancy } from './Occupancy';
import { sizedPlot } from './sizedPlot';
import { TOWN_ASSET_SIZES, type TownAssetId } from './townAssetSizes';
import type { TownPlot } from './TownPlot';

/** What each kind of building keeps against its walls (2 to 5 items), and whether a cart stands by it. */
const STOCK: Partial<Record<TownAssetId, { items: TownAssetId[]; cart?: boolean; fence?: boolean }>> = {
  tavern: { items: ['barrel', 'barrel', 'barrel', 'crate', 'crate'], cart: true },
  blacksmith: { items: ['wood_pile', 'wood_pile', 'barrel', 'crate'], cart: true },
  barracks: { items: ['hay_bale', 'hay_bale', 'hay_bale', 'crate'] },
  windmill: { items: ['hay_bale', 'hay_bale', 'crate'] },
  market_stall: { items: ['crate', 'barrel'] },
  chapel: { items: ['stone_pile', 'bush'] },
  house_a: { items: ['barrel', 'wood_pile'], fence: true },
  house_b: { items: ['crate', 'bush'], fence: true },
  house_c: { items: ['wood_pile', 'wood_pile', 'barrel'], fence: true },
};

/** Gap (m) between a wall and its stock, and between items in a row. */
const WALL_GAP = 0.15;
const ITEM_GAP = 0.1;
/** A back-yard fence stands this far behind the house. */
const YARD = 2.2;

/** Turns a building-local offset (x right, z front) into a town-local plot. */
function local(b: TownPlot, id: TownAssetId, lx: number, lz: number, turn: number): TownPlot {
  const [c, s] = [Math.cos(b.rotation), Math.sin(b.rotation)];
  return sizedPlot(id, b.x + lx * c + lz * s, b.z - lx * s + lz * c, b.rotation + turn);
}

/**
 * Props that belong to a building: its stock in a row against a side wall (seeded side), a cart beside it,
 * and a fence closing the back yard. Anything that does not fit is left out.
 */
export function placeYardProps(buildings: readonly TownPlot[], space: Occupancy, random: Random): TownPlot[] {
  const props: TownPlot[] = [];
  const take = (p: TownPlot) => space.take(p) && props.push(p) > 0;
  for (const b of buildings) {
    const stock = STOCK[b.assetId as TownAssetId];
    if (!stock) continue;
    const { width, depth } = b.footprint;
    const first = random.next() < 0.5 ? 1 : -1;
    for (const side of [first, -first]) {
      let lz = depth / 2 - 0.6;
      let placed = 0;
      for (const id of stock.items) {
        const size = TOWN_ASSET_SIZES[id];
        const reach = Math.max(size.width, size.depth);
        const lx = side * (width / 2 + WALL_GAP + reach / 2);
        if (take(local(b, id, lx, lz - reach / 2, random.range(-0.3, 0.3)))) placed++;
        lz -= reach + ITEM_GAP;
      }
      if (placed >= 2) break;
    }
    if (stock.cart) {
      const cart = TOWN_ASSET_SIZES.cart;
      for (const side of [-first, first]) {
        if (take(local(b, 'cart', side * (width / 2 + 0.4 + cart.width / 2), depth / 2 - cart.depth / 2, 0))) break;
      }
    }
    if (stock.fence) take(local(b, 'fence', 0, -depth / 2 - YARD, 0));
  }
  return props;
}
