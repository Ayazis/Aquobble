/** Source of randomness. Inject a seeded one so worlds are reproducible and testable. */
export interface Random {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform float in [min, max). */
  range(min: number, max: number): number;
  /**
   * An independent stream named `name`, derived from this one's seed only (not from how many numbers
   * were drawn), so adding draws to one feature never shifts another's. Same seed + name, same stream.
   */
  fork(name: string): Random;
}
