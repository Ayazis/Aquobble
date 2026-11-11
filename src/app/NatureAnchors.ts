import type { HeightSampler, Pond } from '@terrain';
import type { TreePlacement } from '@vegetation';

/** Lane F: living details. Where the island's ponds and trees ended up, for the effects that gather around them. */
export interface NatureAnchors {
  ponds: readonly Pond[];
  trees: readonly TreePlacement[];
  ground: HeightSampler;
}
