/** A smooth 2D noise field. Output roughly in [-1, 1]. */
export interface Noise2D {
  sample(x: number, y: number): number;
}
