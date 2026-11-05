import { HeightField } from './HeightField';

describe('HeightField', () => {
  // 3x3, 20 m: columns at x = -10, 0, 10; rows at z = -10, 0, 10.
  const field = new HeightField(3, 20, new Float32Array([0, 2, 4, 0, 2, 4, 10, 12, 14]));

  it('returns exact sample heights on grid points', () => {
    expect(field.heightAt(-10, -10)).toBe(0);
    expect(field.heightAt(10, -10)).toBe(4);
    expect(field.heightAt(0, 10)).toBe(12);
  });

  it('interpolates between samples', () => {
    expect(field.heightAt(5, -10)).toBeCloseTo(3);
    expect(field.heightAt(0, 5)).toBeCloseTo(7);
  });

  it('clamps outside the grid', () => {
    expect(field.heightAt(-100, -100)).toBe(0);
    expect(field.heightAt(100, 100)).toBe(14);
  });

  it('rejects a wrongly sized height array', () => {
    expect(() => new HeightField(3, 20, new Float32Array(4))).toThrow();
  });

  describe('flatten', () => {
    // 21x21, 20 m: 1 m spacing, sample (c, r) sits at x = c - 10, z = r - 10.
    const make = () => new HeightField(21, 20, new Float32Array(21 * 21).fill(10));
    const region = { centerX: 0, centerZ: 0, halfSize: 3, blend: 4 };

    it('sets the inner square exactly to the target height', () => {
      const f = make();
      f.flatten(region, 2);
      for (const [x, z] of [
        [0, 0],
        [3, 3],
        [-3, 2],
        [1, -3],
      ])
        expect(f.heightAt(x, z)).toBeCloseTo(2);
    });

    it('leaves terrain beyond the blend band untouched', () => {
      const f = make();
      f.flatten(region, 2);
      expect(f.heightAt(7, 0)).toBe(10);
      expect(f.heightAt(-10, -10)).toBe(10);
    });

    it('blends monotonically across the band', () => {
      const f = make();
      f.flatten(region, 2);
      const band = [3, 4, 5, 6, 7].map((x) => f.heightAt(x, 0));
      for (let i = 1; i < band.length; i++) expect(band[i]).toBeGreaterThan(band[i - 1]);
      expect(f.heightAt(5, 0)).toBeCloseTo(6); // halfway through the band: halfway between heights
    });

    it('raises low ground as well as lowering high ground', () => {
      const f = make();
      f.flatten(region, 15);
      expect(f.heightAt(0, 0)).toBeCloseTo(15);
    });
  });
});
