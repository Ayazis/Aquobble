/** Source of randomness. Inject a seeded one so worlds are reproducible and testable. */
export interface Random {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform float in [min, max). */
  range(min: number, max: number): number;
}
