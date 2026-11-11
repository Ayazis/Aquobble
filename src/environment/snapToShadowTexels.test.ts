import { describe, expect, it } from 'vitest';
import type { Vec3 } from '@core';
import { snapToShadowTexels } from './snapToShadowTexels';

const raw = { x: 0.3, y: 0.8, z: -0.52 };
const length = Math.hypot(raw.x, raw.y, raw.z);
const dir: Vec3 = { x: raw.x / length, y: raw.y / length, z: raw.z / length };
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const texel = 40 / 1024;

describe('snapToShadowTexels', () => {
  it('moves the centre by at most half a texel diagonal and keeps its depth along the light', () => {
    const center = { x: 12.345, y: 3.21, z: -7.89 };
    const offset = sub(snapToShadowTexels(center, dir, 40, 1024), center);
    expect(Math.hypot(offset.x, offset.y, offset.z)).toBeLessThanOrEqual(texel * Math.SQRT1_2 + 1e-9);
    expect(dot(offset, dir)).toBeCloseTo(0, 9);
  });

  it('gives one result inside a texel and steps by whole texels across the light', () => {
    const a = snapToShadowTexels({ x: 5, y: 0, z: 5 }, dir, 40, 1024);
    const b = snapToShadowTexels({ x: a.x + 0.004, y: a.y, z: a.z + 0.002 }, dir, 40, 1024);
    const far = snapToShadowTexels({ x: 9.3, y: 1, z: 2.7 }, dir, 40, 1024);
    // Only the depth along the light (which is not snapped) may differ.
    const moved = sub(b, a);
    const depth = dot(moved, dir);
    expect(Math.hypot(moved.x - dir.x * depth, moved.y - dir.y * depth, moved.z - dir.z * depth)).toBeLessThan(1e-9);
    // The light's horizontal axis is cross(up, dir), normalised.
    const axis = { x: dir.z, y: 0, z: -dir.x };
    const across = dot(sub(far, a), axis) / Math.hypot(axis.x, axis.z) / texel;
    expect(Math.abs(across - Math.round(across))).toBeLessThan(1e-6);
  });

  it('copes with the light straight overhead', () => {
    const snapped = snapToShadowTexels({ x: 1.01, y: 2, z: 3.02 }, { x: 0, y: 1, z: 0 }, 40, 1024);
    expect(snapped.y).toBeCloseTo(2, 9);
    expect(Math.abs(snapped.x - 1.01)).toBeLessThanOrEqual(texel / 2 + 1e-9);
  });
});
