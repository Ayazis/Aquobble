/** Axis-aligned world rectangle a pond must stay clear of (e.g. the town). */
export interface PondAvoidArea {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface PondOptions {
  /** Number of ponds to try to carve (fewer if no good spot is found). */
  count: number;
  /** Candidate centres lie in [-extent, extent] on x and z. */
  extent: number;
  minRadius: number;
  maxRadius: number;
  /** Depth of the bowl below the water surface at the centre. */
  depth: number;
  /** Lowest allowed water surface, keeps ponds above the sea. */
  minLevel: number;
  /** How far the rim must stay above the water surface. */
  freeboard: number;
  avoid?: readonly PondAvoidArea[];
}
