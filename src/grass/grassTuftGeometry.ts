import * as THREE from 'three';

const BLADES = 3;
const BASE = new THREE.Color(0x2f4a1c);
const TIP = new THREE.Color(0xd8e8a0);

/**
 * A tuft of curved blades fanned around the base, each two segments (3 triangles). Vertex colours run
 * dark at the root to light at the tip; the instance colour tints the whole tuft.
 */
export function grassTuftGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colours: number[] = [];
  const normals: number[] = [];
  for (let b = 0; b < BLADES; b++) {
    const angle = (b / BLADES) * Math.PI + b * 0.4;
    const height = 0.42 + 0.14 * ((b * 7) % 3);
    addBlade(positions, colours, normals, { angle, height, lean: 0.08 + 0.05 * b, offset: (b - 1) * 0.04 });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  return g;
}

interface Blade {
  angle: number;
  height: number;
  lean: number;
  offset: number;
}

function addBlade(pos: number[], col: number[], nor: number[], { angle, height, lean, offset }: Blade): void {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  // Blade in its own (u = across, v = up, w = lean) frame, then rotated by angle about y.
  const at = (u: number, v: number): number[] => {
    const w = lean * v * v + offset;
    return [u * c - w * s, v * height, u * s + w * c];
  };
  const l0 = at(-0.035, 0);
  const r0 = at(0.035, 0);
  const l1 = at(-0.024, 0.55);
  const r1 = at(0.024, 0.55);
  const tip = at(0, 1);
  const tris = [l0, r0, r1, l0, r1, l1, l1, r1, tip];
  const vs = [0, 0, 0.55, 0, 0.55, 0.55, 0.55, 0.55, 1];
  const colour = new THREE.Color();
  tris.forEach((p, i) => {
    pos.push(...p);
    // Mostly-up normals so blades light like the ground instead of flickering with facing.
    nor.push(-s * 0.3, 1, c * 0.3);
    colour.copy(BASE).lerp(TIP, vs[i] ** 1.3);
    col.push(colour.r, colour.g, colour.b);
  });
}
