/** A fixed camera pose. Heights are metres above the ground at that point, unless `absolute`. */
export interface ShotView {
  name: string;
  from: [x: number, height: number, z: number];
  at: [x: number, height: number, z: number];
  /** Heights are world y instead of above ground (for views from the air). */
  absolute?: boolean;
}

/** Times of day by name: 0 = midnight, 0.5 = noon. */
export const TIMES: Record<string, number> = { morning: 0.42, noon: 0.5, sunset: 0.72, night: 0.95 };

/** The reference views of the default world (seed 1337): every surface the graphics plan talks about. */
export const VIEWS: ShotView[] = [
  { name: 'plaza', from: [3.5, 1.6, 6.5], at: [0.5, 0, 2] },
  { name: 'lane', from: [0, 1.7, 22], at: [0, 6, -30] },
  { name: 'street', from: [1.2, 1.5, 15], at: [0, 0, 9] },
  { name: 'house', from: [9, 1.6, 4], at: [16, 2.5, 8] },
  { name: 'wall', from: [5, 1.7, 19], at: [9, 1.6, 23.5] },
  { name: 'gate', from: [0, 1.5, 36], at: [0, 1.5, 26] },
  { name: 'meadow', from: [3, 1.5, -42], at: [0.5, 0.6, -30] },
  { name: 'grass', from: [3, 0.7, -42], at: [2.4, 0.25, -39] },
  { name: 'forest', from: [-26, 1.6, 33], at: [-31, 2.5, 29.5] },
  { name: 'rock', from: [60.3, 1.4, -54.5], at: [56.8, 0.5, -57] },
  { name: 'pond', from: [57.8, 2.5, -46.2], at: [48.8, 1.5, -53.2] },
  { name: 'coast', from: [38, 2, 62], at: [10, 1, 40] },
  { name: 'shore', from: [3, 1.6, 51], at: [0, 0.3, 40] },
  { name: 'overview', from: [70, 48, 70], at: [0, 4, 0], absolute: true },
];
