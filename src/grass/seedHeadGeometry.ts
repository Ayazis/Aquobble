import * as THREE from 'three';

/** Stalks per tuft, each a thin tapering quad (2 triangles) topped by a crossed-quad seed head (4 triangles). */
const STALKS = 3;
const HEAD_LENGTH = 0.14;
const HEAD_HALF_WIDTH = 0.022;

/**
 * Tall seed-head grass: a few slender stalks fanned out and leaning, each with a seed head at the top
 * (18 triangles). The vertex colour holds the root-to-tip blend weight the grass material reads, so the
 * stalks run from ground colour up to the tip colour and the heads take the tip colour.
 */
export function seedHeadGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const weights: number[] = [];
  for (let k = 0; k < STALKS; k++) {
    const angle = k * 2.1 + 0.3;
    const height = 0.85 + 0.12 * k;
    const lean = 0.1 + 0.04 * k;
    const dir = [Math.cos(angle), Math.sin(angle)];
    const across = [-dir[1], dir[0]];
    const point = (v: number, u: number): number[] => [
      dir[0] * lean * v * v + across[0] * u,
      height * v,
      dir[1] * lean * v * v + across[1] * u,
    ];
    const quad = (a: number[], b: number[], c: number[], d: number[], wa: number, wc: number) => {
      positions.push(...a, ...b, ...c, ...a, ...c, ...d);
      weights.push(wa, wa, wc, wa, wc, wc);
    };
    quad(point(0, -0.01), point(0, 0.01), point(1, 0.003), point(1, -0.003), 0, 1);
    // Seed head: two quads crossed along the stalk tip, widest in the middle.
    const top = point(1, 0);
    const tip = [top[0] + dir[0] * 0.04, top[1] + HEAD_LENGTH, top[2] + dir[1] * 0.04];
    const mid = top.map((t, i) => (t + tip[i]) / 2);
    for (const side of [across, dir]) {
      const l = [mid[0] - side[0] * HEAD_HALF_WIDTH, mid[1], mid[2] - side[1] * HEAD_HALF_WIDTH];
      const r = [mid[0] + side[0] * HEAD_HALF_WIDTH, mid[1], mid[2] + side[1] * HEAD_HALF_WIDTH];
      positions.push(...top, ...r, ...tip, ...top, ...tip, ...l);
      weights.push(1, 1, 1, 1, 1, 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  // Mostly-up normals, like the short grass, so the tufts light like the ground around them.
  g.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(
      positions.map((_, i) => (i % 3 === 1 ? 1 : 0)),
      3,
    ),
  );
  g.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(
      weights.flatMap((w) => [w, w, w]),
      3,
    ),
  );
  return g;
}
