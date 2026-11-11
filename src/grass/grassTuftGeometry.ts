import * as THREE from 'three';

/** Shapes the root-to-tip colour blend: above 1 keeps the ground colour further up the blade. */
const TIP_CURVE = 1.3;

/**
 * A tuft of `blades` curved blades fanned around the base, each two segments (3 triangles). Vertex colours hold a
 * blend weight, 0 at the root to 1 at the tip, that the material uses to run from ground colour to tip colour.
 */
export function grassTuftGeometry(blades = 3, halfWidth = 0.035): THREE.BufferGeometry {
  const positions: number[] = [];
  const colours: number[] = [];
  const normals: number[] = [];
  for (let b = 0; b < blades; b++) {
    const angle = (b / blades) * Math.PI + b * 0.4;
    const height = 0.42 + 0.14 * ((b * 7) % 3);
    const lean = 0.08 + 0.05 * (b % 3);
    addBlade(positions, colours, normals, { angle, height, lean, offset: (b - (blades - 1) / 2) * 0.04, halfWidth });
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
  halfWidth: number;
}

function addBlade(
  pos: number[],
  col: number[],
  nor: number[],
  { angle, height, lean, offset, halfWidth }: Blade,
): void {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  // Blade in its own (u = across, v = up, w = lean) frame, then rotated by angle about y.
  const at = (u: number, v: number): number[] => {
    const w = lean * v * v + offset;
    return [u * c - w * s, v * height, u * s + w * c];
  };
  const l0 = at(-halfWidth, 0);
  const r0 = at(halfWidth, 0);
  const l1 = at(-halfWidth * 0.7, 0.55);
  const r1 = at(halfWidth * 0.7, 0.55);
  const tip = at(0, 1);
  const tris = [l0, r0, r1, l0, r1, l1, l1, r1, tip];
  const vs = [0, 0, 0.55, 0, 0.55, 0.55, 0.55, 0.55, 1];
  tris.forEach((p, i) => {
    pos.push(...p);
    // Mostly-up normals so blades light like the ground instead of flickering with facing.
    nor.push(-s * 0.3, 1, c * 0.3);
    const weight = vs[i] ** TIP_CURVE;
    col.push(weight, weight, weight);
  });
}
