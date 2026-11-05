import { vec3 } from '@core';
import { followPosition, orbitDirection, unobstructedDistance } from './followCamera';

describe('followCamera', () => {
  it('sits behind (+z) the pivot at yaw 0 and level pitch', () => {
    const p = followPosition(vec3(1, 2, 3), 0, 0, 5);
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(2);
    expect(p.z).toBeCloseTo(8);
  });

  it('rotates around the pivot with yaw (yaw +90° puts the camera on +x)', () => {
    const p = followPosition(vec3(), Math.PI / 2, 0, 4);
    expect(p.x).toBeCloseTo(4);
    expect(p.z).toBeCloseTo(0);
  });

  it('raises the camera with pitch and keeps the distance', () => {
    const d = orbitDirection(0.7, Math.PI / 4);
    expect(d.y).toBeCloseTo(Math.SQRT1_2);
    expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(1);
  });

  it('pulls the camera in front of an obstruction', () => {
    expect(unobstructedDistance(10, null, 0.3, 1)).toBe(10);
    expect(unobstructedDistance(10, 12, 0.3, 1)).toBe(10);
    expect(unobstructedDistance(10, 4, 0.3, 1)).toBeCloseTo(3.7);
    expect(unobstructedDistance(10, 0.5, 0.3, 1)).toBe(1);
  });
});
