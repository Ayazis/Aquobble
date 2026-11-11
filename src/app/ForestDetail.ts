/** How far (m from a map cell's centre) the forest is drawn in full before cheaper levels take over. */
export interface ForestDetail {
  /** Tree models within this, simple stand-in trees beyond. */
  treeDistance: number;
  /** Bushes, ferns, mushrooms, logs and stumps within this, nothing beyond. */
  floorDistance: number;
}
