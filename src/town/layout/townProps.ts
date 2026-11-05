import type { TownPlot } from './TownPlot';

const prop = (assetId: string, x: number, z: number, rotation: number, w: number, d: number, h: number): TownPlot => ({
  assetId,
  x,
  z,
  rotation,
  footprint: { width: w, depth: d, height: h },
});

const lantern = (x: number, z: number) => prop('lantern_post', x, z, 0, 0.4, 0.4, 3);
const sign = (x: number, z: number, rotation: number) => prop('sign_post', x, z, rotation, 0.6, 0.3, 2);
const bush = (x: number, z: number) => prop('bush', x, z, 0, 1.5, 1.5, 1.2);

/** Small props around the square, along the roads and next to the buildings. */
export const TOWN_PROPS: TownPlot[] = [
  lantern(13, 13),
  lantern(-13, 13),
  lantern(13, -13),
  lantern(-13, -13),
  lantern(4, 30),
  lantern(-4, -30),
  lantern(30, -4),
  lantern(-30, 4),
  prop('bench', 6, 10, Math.PI, 2, 0.6, 0.5),
  prop('bench', -6, 10, Math.PI, 2, 0.6, 0.5),
  prop('barrel', 15, 19, 0, 0.8, 0.8, 1),
  prop('barrel', 15, 20.2, 0, 0.8, 0.8, 1),
  prop('crate', 9.8, -11, 0.3, 1, 1, 1),
  prop('crate', -9.8, -11, -0.2, 1, 1, 1),
  prop('hay_bale', 16, 38, 0, 1.2, 1.2, 1),
  prop('hay_bale', 16, 40, 0.4, 1.2, 1.2, 1),
  prop('cart', 5, 48, 0, 2, 3.5, 1.5),
  sign(4.5, 54, 0),
  sign(-4.5, -54, Math.PI),
  sign(54, -4.5, Math.PI / 2),
  sign(-54, 4.5, -Math.PI / 2),
  prop('fence', -44, 21, 0, 8, 0.2, 1),
  bush(32, 32),
  bush(-30, -30),
  bush(-50, 30),
  bush(50, -50),
  prop('stone_pile', -46, -40, 0, 2, 2, 0.8),
];
