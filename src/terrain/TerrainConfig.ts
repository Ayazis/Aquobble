export interface TerrainConfig {
  /** World size in metres (square). */
  size: number;
  /** Grid samples per side (segments + 1). */
  samples: number;
  /** World units per noise unit; larger = broader hills. */
  noiseScale: number;
  /** Peak height above the base. */
  amplitude: number;
  /** Height offset; negative values sink more terrain below the water. */
  baseHeight: number;
  /** How strongly the edges are pulled down into an island. */
  islandFalloff: number;
}

export const DEFAULT_TERRAIN: TerrainConfig = {
  size: 200,
  samples: 81,
  noiseScale: 50,
  amplitude: 52,
  baseHeight: -16,
  islandFalloff: 18,
};
