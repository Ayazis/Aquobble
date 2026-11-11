import { describe, expect, it } from 'vitest';
import { inTallGrass, tallGrassCover } from './TallGrassCover';

describe('tallGrassCover', () => {
  it('finds spots in cells that hold a tuft', () => {
    const cover = tallGrassCover([{ x: 3.2, z: -1 }]);
    expect(inTallGrass(cover, 3.9, -0.2)).toBe(true);
    expect(inTallGrass(cover, 6, 6)).toBe(false);
  });
});
