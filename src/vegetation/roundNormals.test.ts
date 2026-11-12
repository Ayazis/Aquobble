import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { crownCentre, roundNormals } from './roundNormals';

describe('roundNormals', () => {
  it('fans the normals of a flat card out from the centre', () => {
    const card = new THREE.PlaneGeometry(2, 2).translate(0, 3, 0);
    roundNormals(card, new THREE.Vector3(0, 3, -1), 1);
    const n = card.attributes.normal;
    // Corners lean away from the middle, to their own side, and stay unit length.
    expect(n.getX(0)).toBeLessThan(0);
    expect(n.getX(1)).toBeGreaterThan(0);
    expect(Math.hypot(n.getX(0), n.getY(0), n.getZ(0))).toBeCloseTo(1);
  });

  it('places the centre low in the crown', () => {
    const crown = new THREE.BoxGeometry(2, 6, 2).translate(0, 5, 0);
    const centre = crownCentre(crown);
    expect(centre.y).toBeCloseTo(2 + 6 * 0.35);
    expect(centre.x).toBeCloseTo(0);
  });
});
