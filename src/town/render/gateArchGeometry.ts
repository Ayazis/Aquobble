import * as THREE from 'three';
import type { TownWall } from '../layout/TownWall';
import { ARCH_RISE, gateArch } from './gateArch';

const SEGMENTS = 6;

/** Stone spandrels filling each gate between its posts and lintel, cut by a low-poly elliptical arch. */
export function gateArchGeometries(wall: TownWall): THREE.BufferGeometry[] {
  return wall.gates.map((gate) => {
    const { halfSpan: r, springing: s, top, depth } = gateArch(wall, gate);
    const shape = new THREE.Shape();
    shape.moveTo(-r, top);
    shape.lineTo(r, top);
    shape.lineTo(r, s);
    shape.absellipse(0, s, r, ARCH_RISE, 0, Math.PI, false, 0);
    shape.lineTo(-r, top);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: SEGMENTS });
    geo.translate(0, 0, -depth / 2);
    const sign = gate.side === 'north' || gate.side === 'east' ? 1 : -1;
    if (gate.side === 'east' || gate.side === 'west') {
      geo.rotateY(Math.PI / 2);
      geo.translate(sign * wall.halfSize, 0, 0);
    } else {
      geo.translate(0, 0, sign * wall.halfSize);
    }
    return geo;
  });
}
