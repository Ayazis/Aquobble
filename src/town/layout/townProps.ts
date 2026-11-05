import type { TownPlot } from './TownPlot';

const prop = (assetId: string, x: number, z: number, rotation: number, w: number, d: number, h: number): TownPlot => ({
  assetId,
  x,
  z,
  rotation,
  footprint: { width: w, depth: d, height: h },
});

const lantern = (x: number, z: number) => prop('lantern_post', x, z, 0, 0.6, 1, 2.8);
const sign = (x: number, z: number, rotation: number) => prop('sign_post', x, z, rotation, 1.6, 0.5, 2.2);
const bush = (x: number, z: number) => prop('bush', x, z, 0, 1.6, 1.6, 1);
const barrel = (x: number, z: number) => prop('barrel', x, z, 0, 0.7, 0.7, 0.95);
const crate = (x: number, z: number, rotation: number) => prop('crate', x, z, rotation, 0.8, 0.8, 0.7);
const woodPile = (x: number, z: number, rotation: number) => prop('wood_pile', x, z, rotation, 1.2, 1.2, 0.8);

/** Small props at real-world scale around the square, along the lanes and next to the buildings. */
export const TOWN_PROPS: TownPlot[] = [
  lantern(6, 6),
  lantern(-6, 6),
  lantern(6, -6),
  lantern(-6, -6),
  lantern(2.8, 16),
  lantern(-2.8, -16),
  lantern(14, 2.8),
  lantern(-14, 2.8),
  lantern(-14, -2.8),
  prop('bench', 3.5, 5.5, Math.PI, 1.8, 0.6, 0.85),
  prop('bench', -3.5, 5.5, Math.PI, 1.8, 0.6, 0.85),
  barrel(14.5, 9),
  barrel(14.5, 10),
  barrel(15.4, 9.5),
  crate(6.2, -4.5, 0.3),
  crate(-6.2, -4.5, -0.2),
  crate(12, -5, 0.15),
  crate(12.9, -5.2, -0.4),
  prop('hay_bale', 12.5, 19, 0, 1.2, 1.2, 1),
  prop('hay_bale', 12.5, 20.5, 0.4, 1.2, 1.2, 1),
  prop('cart', 3.5, 23, 0.1, 1.6, 3, 1.8),
  sign(-3.5, 24, 0),
  sign(3.5, -24, Math.PI),
  sign(24, 3.5, Math.PI / 2),
  sign(-24, -3.5, -Math.PI / 2),
  prop('fence', -21, 12, 0, 6, 0.3, 1.1),
  bush(-14, -18),
  bush(22, 21),
  bush(-22, 22),
  bush(22, -22),
  prop('stone_pile', -21, -16, 0, 2.4, 1.6, 0.7),
  woodPile(17.5, -14, 0.2),
  woodPile(17.5, -15.5, -0.3),
  woodPile(-4, -16.5, 0),
  prop('hay_bale', -14.5, -21, 0.2, 1.2, 1.2, 1),
];
