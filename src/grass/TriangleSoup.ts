import * as THREE from 'three';

type Point = readonly [number, number, number];

/** Collects coloured, flat-shaded triangles into a geometry. */
export class TriangleSoup {
  private readonly positions: number[] = [];
  private readonly normals: number[] = [];
  private readonly colours: number[] = [];

  /**
   * Adds a triangle. With `faceUp` its corners are ordered so the front face is the upper one: thin leaves
   * and petals are drawn two-sided, and this keeps the side the sky sees lit as the top.
   */
  add(a: Point, b: Point, c: Point, colour: THREE.Color, faceUp = false): void {
    const n = normalOf(a, b, c);
    const flip = faceUp && n[1] < 0;
    for (const p of flip ? [a, c, b] : [a, b, c]) {
      this.positions.push(...p);
      this.normals.push(...(flip ? n.map((v) => -v) : n));
      this.colours.push(colour.r, colour.g, colour.b);
    }
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.colours, 3));
    return g;
  }
}

function normalOf(a: Point, b: Point, c: Point): number[] {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const length = Math.hypot(n[0], n[1], n[2]) || 1;
  return n.map((x) => x / length);
}
