/**
 * Splits points on the ground into square map cells of `cellSize` metres. Drawing each cell as its own
 * object lets the renderer skip the ones outside the camera's view, instead of one object that is always
 * drawn in full. Cells and the items inside them keep first-seen order, so results are reproducible.
 */
export function groupByCell<T extends { x: number; z: number }>(items: readonly T[], cellSize: number): T[][] {
  const cells = new Map<string, T[]>();
  for (const item of items) {
    const key = `${Math.floor(item.x / cellSize)},${Math.floor(item.z / cellSize)}`;
    const cell = cells.get(key);
    if (cell) cell.push(item);
    else cells.set(key, [item]);
  }
  return [...cells.values()];
}
