import { describe, expect, it } from 'vitest';
import { grassBladeGeometry } from './grassBladeGeometry';

describe('grassBladeGeometry', () => {
  it('is a strip of quads closed by one triangle at the tip', () => {
    const g = grassBladeGeometry(5);
    const position = g.getAttribute('position');
    expect(position.count).toBe(11);
    expect(g.getIndex()?.count).toBe((4 * 2 + 1) * 3);
    expect([position.getX(10), position.getY(10)]).toEqual([0, 1]);
    for (let i = 0; i < 10; i++) expect(Math.abs(position.getX(i))).toBe(1);
  });

  it('still makes a blade from a single segment', () => {
    expect(grassBladeGeometry(1).getIndex()?.count).toBe(3);
  });
});
