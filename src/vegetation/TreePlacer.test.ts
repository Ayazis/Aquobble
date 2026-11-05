import { SeededRandom } from '@core';
import { TreePlacer } from './TreePlacer';

describe('TreePlacer', () => {
  // Ground rises along x: height = x.
  const slope = { heightAt: (x: number) => x };

  it('only places trees within the height band', () => {
    const trees = new TreePlacer(slope, new SeededRandom(3)).place({
      count: 50,
      extent: 20,
      minHeight: 2,
      maxHeight: 10,
    });
    expect(trees).toHaveLength(50);
    for (const t of trees) {
      expect(t.x).toBeGreaterThanOrEqual(2);
      expect(t.x).toBeLessThanOrEqual(10);
    }
  });

  it('gives up instead of looping forever when nothing fits', () => {
    const trees = new TreePlacer(slope, new SeededRandom(3)).place({
      count: 10,
      extent: 20,
      minHeight: 100,
      maxHeight: 200,
    });
    expect(trees).toEqual([]);
  });
});
