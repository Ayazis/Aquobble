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
});
