import type { TownPlot } from './TownPlot';
import { sizedPlot as prop } from './sizedPlot';

/** Lanterns on the square's corners and along the four lanes. */
const LANTERNS: TownPlot[] = [
  ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => prop('lantern_post', sx * 5.15, sz * 5.15))),
  prop('lantern_post', 1.95, 9),
  prop('lantern_post', -1.95, 21.5),
  prop('lantern_post', -1.95, -9),
  prop('lantern_post', 1.95, -22),
  prop('lantern_post', 8.5, 2.3),
  prop('lantern_post', 22.3, 1.95, Math.PI / 2),
  prop('lantern_post', -10.2, -1.95, Math.PI / 2),
  prop('lantern_post', -22.3, 1.95, Math.PI / 2),
];

/** The market square: benches, a cart and the stalls' stock, plus a signpost inside each gate. */
export const SQUARE_PROPS: TownPlot[] = [
  ...LANTERNS,
  prop('bench', 3.2, 4.7, Math.PI),
  prop('bench', 4.9, 2.6, -Math.PI / 2),
  prop('bench', -0.6, 4.9, Math.PI),
  prop('cart', 2.2, 2.4, 0.5),
  prop('crate', 4.9, -0.9, 0.3),
  prop('barrel', 1.6, -4.8),
  prop('barrel', 1.55, -3.9),
  prop('crate', -4.9, -0.9, 0.15),
  prop('barrel', -1.6, -4.6),
  prop('hay_bale', -1.5, -3.5),
  prop('barrel', -1.5, 2.4),
  prop('crate', -1.45, 3.4, -0.4),
  prop('hay_bale', -5.1, 1.2),
  prop('sign_post', -2.6, 22.6),
  prop('sign_post', -2.6, -22.6, Math.PI),
  prop('sign_post', 22.75, -2.6, Math.PI / 2),
  prop('sign_post', -22.3, -2.6, -Math.PI / 2),
];
