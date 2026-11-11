import type * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { DEFAULT_TOWN_LAYOUT } from '../layout/defaultTownLayout';
import { wallBoxes } from './wallBoxes';
import { WallFactory } from './WallFactory';

describe('WallFactory', () => {
  const wall = DEFAULT_TOWN_LAYOUT.wall;
  const { object, boxes } = new WallFactory().create(wall);
  const meshes = object.children as THREE.Mesh[];

  it('collides only with the structural boxes, so the gates stay open', () => {
    expect(boxes).toEqual(wallBoxes(wall));
  });

  it('is two vertex-coloured meshes (stone and wood)', () => {
    expect(meshes).toHaveLength(2);
    for (const m of meshes) expect(m.geometry.getAttribute('color')).toBeDefined();
    const tris = meshes.map((m) => m.geometry.getAttribute('position').count / 3);
    expect(tris[0] + tris[1]).toBeLessThan(10000);
  });
});
