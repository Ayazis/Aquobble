import { describe, expect, it } from 'vitest';
import { FLOWER_SHAPES } from './FlowerShape';
import { flowerGeometry } from './flowerGeometry';

describe('flowerGeometry', () => {
  const stem = [0.1, 0.3, 0.05];

  it('builds every wildflower as a stem with a head of petals above it', () => {
    for (const shape of FLOWER_SHAPES) {
      const g = flowerGeometry(shape, stem);
      g.computeBoundingBox();
      const florets = shape.florets ?? 1;
      const triangles = 6 + 4 + florets * (shape.petals * 2 + 6);
      expect(g.getAttribute('position').count).toBe(triangles * 3);
      expect(g.boundingBox?.min.y).toBeCloseTo(0);
      expect(g.boundingBox?.max.y).toBeGreaterThan(shape.height);
      expect(g.boundingBox?.max.y).toBeLessThan(shape.height + shape.length + 0.05);
    }
  });

  it('turns petals and leaves so their upper side is the front face', () => {
    const g = flowerGeometry(FLOWER_SHAPES[1], stem);
    const normal = g.getAttribute('normal');
    // Past the stem's six triangles everything is a leaf, petal or centre.
    for (let i = 18; i < normal.count; i++) expect(normal.getY(i)).toBeGreaterThanOrEqual(0);
  });
});
