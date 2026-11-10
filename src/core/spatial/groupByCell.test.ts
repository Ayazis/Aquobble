import { describe, expect, it } from 'vitest';
import { groupByCell } from './groupByCell';

describe('groupByCell', () => {
  it('keeps every item exactly once', () => {
    const items = Array.from({ length: 200 }, (_, i) => ({ x: Math.sin(i) * 90, z: Math.cos(i * 1.7) * 90 }));
    const cells = groupByCell(items, 25);
    expect(cells.flat()).toHaveLength(items.length);
    expect(new Set(cells.flat()).size).toBe(items.length);
  });

  it('puts only neighbours in the same cell', () => {
    for (const cell of groupByCell(
      [
        { x: 1, z: 1 },
        { x: 24, z: 3 },
        { x: 26, z: 3 },
        { x: -1, z: 1 },
      ],
      25,
    )) {
      const xs = cell.map((p) => Math.floor(p.x / 25));
      expect(new Set(xs).size).toBe(1);
    }
  });

  it('separates points on either side of zero', () => {
    expect(
      groupByCell(
        [
          { x: 1, z: 1 },
          { x: -1, z: 1 },
        ],
        25,
      ),
    ).toHaveLength(2);
  });
});
