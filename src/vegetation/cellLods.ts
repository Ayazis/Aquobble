import * as THREE from 'three';
import { groupByCell } from '@core';

/**
 * Groups `items` into square map cells and gives each cell a THREE.LOD at its centre: `near` up close and
 * `far` (often an empty object) once the camera is more than `distance` metres from the cell centre. The
 * renderer picks the level each frame; off-screen cells are frustum-culled as before. Builders return
 * objects in world coordinates; they are shifted so the LOD can sit at the cell centre.
 */
export function cellLods<T extends { x: number; y: number; z: number }>(
  items: readonly T[],
  cellSize: number,
  distance: number,
  near: (cell: readonly T[]) => THREE.Object3D,
  far: (cell: readonly T[]) => THREE.Object3D,
): THREE.Group {
  const group = new THREE.Group();
  for (const cell of groupByCell(items, cellSize)) {
    const centre = new THREE.Vector3();
    for (const item of cell) centre.add(new THREE.Vector3(item.x, item.y, item.z));
    centre.divideScalar(cell.length);
    const lod = new THREE.LOD();
    lod.position.copy(centre);
    for (const [level, at] of [
      [near(cell), 0],
      [far(cell), distance],
    ] as const) {
      level.position.sub(centre);
      lod.addLevel(level, at);
    }
    group.add(lod);
  }
  return group;
}
