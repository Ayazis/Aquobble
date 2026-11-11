/** Shape of the gust fronts. Mirrored by the `uGust*` uniforms in `windShaderChunk`. */
export interface GustFronts {
  /** Distance between two fronts along the wind, in metres. */
  spacing: number;
  /** How fast fronts travel downwind, in metres per second. */
  speed: number;
  /** Seeded phase that wobbles the front lines so they are not straight. */
  phase: number;
}
