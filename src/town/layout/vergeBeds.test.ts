import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { connectedParts } from '../render/splitSails';
import { DEFAULT_TOWN_LAYOUT } from './defaultTownLayout';
import { doorPaths } from './doorPaths';
import { distanceToRect, plotRect } from './GroundRect';
import { placeVergeBeds } from './placeVergeBeds';

const layout = DEFAULT_TOWN_LAYOUT;

describe('verges and yards', () => {
  it('gives every building a worn track out of its door', () => {
    const paths = doorPaths(layout);
    expect(paths).toHaveLength(layout.buildings.length);
    for (const p of paths) expect(p.halfDepth).toBeGreaterThan(0.5);
  });

  it('puts beds on the verges, clear of footprints, and the same for the same seed', () => {
    const beds = placeVergeBeds(layout, new SeededRandom(7));
    expect(beds.length).toBeGreaterThan(8);
    for (const b of beds) {
      for (const plot of layout.buildings) expect(distanceToRect(plotRect(plot), b.x, b.z)).toBeGreaterThan(0.3);
    }
    expect(placeVergeBeds(layout, new SeededRandom(7))).toEqual(beds);
  });
});

describe('connectedParts', () => {
  it('labels separate triangles apart and shared ones together', () => {
    const parts = connectedParts([0, 1, 2, 2, 3, 4, 5, 6, 7], 8);
    expect(parts[4]).toBe(parts[0]);
    expect(parts[5]).not.toBe(parts[0]);
    expect(parts[7]).toBe(parts[5]);
  });
});
