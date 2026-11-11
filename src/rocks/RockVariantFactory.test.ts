import { SeededRandom } from '@core';
import { ROCK_FAMILIES } from './RockFamily';
import { RockVariantFactory } from './RockVariantFactory';

describe('RockVariantFactory', () => {
  const set = new RockVariantFactory(new SeededRandom(5)).createSet(2);

  it('makes the asked number of shapes for every family', () => {
    for (const family of ROCK_FAMILIES) expect(set[family]).toHaveLength(2);
    expect(set.boulder[0].geometry.attributes.position.array).not.toEqual(
      set.boulder[1].geometry.attributes.position.array,
    );
  });

  it('keeps shapes near unit size, with slabs flat', () => {
    for (const family of ROCK_FAMILIES) {
      for (const { geometry } of set[family]) {
        geometry.computeBoundingSphere();
        expect(geometry.boundingSphere?.radius).toBeGreaterThan(0.5);
        expect(geometry.boundingSphere?.radius).toBeLessThan(1.8);
      }
    }
    const slab = set.slab[0].geometry;
    slab.computeBoundingBox();
    expect((slab.boundingBox?.max.y ?? 1) - (slab.boundingBox?.min.y ?? 0)).toBeLessThan(0.8);
  });

  it('darkens the base and gives a hull of distinct points', () => {
    const { geometry, hull } = set.boulder[0];
    const colours = geometry.attributes.color;
    const positions = geometry.attributes.position;
    let lowest = 0;
    let highest = 0;
    for (let i = 0; i < positions.count; i++) {
      if (positions.getY(i) < positions.getY(lowest)) lowest = i;
      if (positions.getY(i) > positions.getY(highest)) highest = i;
    }
    expect(colours.getX(lowest)).toBeLessThan(0.7);
    expect(colours.getX(highest)).toBe(1);
    expect(hull.length).toBeLessThan(positions.count * 3);
    expect(hull.length % 3).toBe(0);
  });
});
