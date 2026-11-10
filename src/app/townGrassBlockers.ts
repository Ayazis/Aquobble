import type { GrassBlocker } from '@grass';
import { roadBounds, type Bounds, type PlacedTown, type TownObstacle } from '@town';

/**
 * Roads and the square block grass this far inside their edge, so the lawn grows into their frayed strip.
 * Matches FEATHER in the town slice's RoadMeshFactory (the width of that strip).
 */
const FRAY_INSET = 0.7;
/** Width (m) of the thinning band beside a road or the square: short, so no bald band shows along the fray. */
const PAVING_FEATHER = 0.4;

/** Ground in the town where grass cannot grow: building, prop and wall footprints, roads and the plaza. */
export function townGrassBlockers(town: PlacedTown, obstacles: readonly TownObstacle[]): GrassBlocker[] {
  const { origin, layout } = town;
  const paving = (b: Bounds): GrassBlocker => ({
    kind: 'rect',
    x: origin.x + (b.minX + b.maxX) / 2,
    z: origin.z + (b.minZ + b.maxZ) / 2,
    halfWidth: Math.max((b.maxX - b.minX) / 2, 0),
    halfDepth: Math.max((b.maxZ - b.minZ) / 2, 0),
    rotation: 0,
    feather: PAVING_FEATHER,
  });
  const p = layout.plazaHalfSize - FRAY_INSET;
  return [
    ...obstacles.map((o): GrassBlocker => ({ kind: 'rect', ...o })),
    ...layout.roads.map((road) => paving(roadCore(roadBounds(road), road.from.z === road.to.z))),
    paving({ minX: -p, maxX: p, minZ: -p, maxZ: p }),
  ];
}

/**
 * The road without its frayed sides, reaching in at the end nearer the town centre to meet the shrunken
 * square (the road mesh runs on under the square's frayed edge there).
 */
function roadCore(b: Bounds, alongX: boolean): Bounds {
  const i = FRAY_INSET;
  if (alongX) {
    const inner = Math.abs(b.minX) < Math.abs(b.maxX);
    return {
      minX: b.minX - (inner ? i : 0),
      maxX: b.maxX + (inner ? 0 : i),
      minZ: b.minZ + i,
      maxZ: b.maxZ - i,
    };
  }
  const inner = Math.abs(b.minZ) < Math.abs(b.maxZ);
  return { minX: b.minX + i, maxX: b.maxX - i, minZ: b.minZ - (inner ? i : 0), maxZ: b.maxZ + (inner ? 0 : i) };
}
