import type { NavGrid } from './NavGrid';

/** Cells of the biggest group of walkable cells connected by straight (four-way) steps, in index order. */
export function largestRegion(grid: NavGrid): Int32Array {
  const { cols, rows, size } = grid;
  const label = new Int32Array(size);
  const stack: number[] = [];
  let best = 0;
  let bestCount = 0;
  let regions = 0;

  for (let seed = 0; seed < size; seed++) {
    if (label[seed] !== 0 || !grid.isWalkable(seed % cols, Math.floor(seed / cols))) continue;
    const id = ++regions;
    let count = 0;
    label[seed] = id;
    stack.push(seed);
    while (stack.length > 0) {
      const cell = stack.pop() as number;
      count++;
      const col = cell % cols;
      const row = (cell - col) / cols;
      for (const [nc, nr] of [
        [col + 1, row],
        [col - 1, row],
        [col, row + 1],
        [col, row - 1],
      ]) {
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const next = nr * cols + nc;
        if (label[next] !== 0 || !grid.isWalkable(nc, nr)) continue;
        label[next] = id;
        stack.push(next);
      }
    }
    if (count > bestCount) [best, bestCount] = [id, count];
  }

  const cells = new Int32Array(bestCount);
  let n = 0;
  for (let cell = 0; cell < size; cell++) if (label[cell] === best && best !== 0) cells[n++] = cell;
  return cells;
}
