import * as THREE from 'three';
import type { FlowerShape } from './FlowerShape';
import { TriangleSoup } from './TriangleSoup';

type Point = [number, number, number];

/**
 * One wildflower standing on the origin: a thin stem with two leaves, and a head of real petals round a
 * centre disc (or, for spikes, small heads spiralling up the stem). Colours are baked into vertex colours:
 * `stem` (linear RGB) for stem and leaves, the shape's own for petals and centre.
 */
export function flowerGeometry(shape: FlowerShape, stem: readonly number[]): THREE.BufferGeometry {
  const soup = new TriangleSoup();
  const green = new THREE.Color().setRGB(stem[0], stem[1], stem[2]);
  addStem(soup, shape.height, green);
  for (const [angle, y] of [
    [0.6, 0.28],
    [3.9, 0.42],
  ])
    addLeaf(soup, angle, shape.height * y, green);
  const florets = shape.florets ?? 1;
  for (let k = 0; k < florets; k++) {
    // A single head sits on the tip; a spike's heads spiral down from it, smaller towards the top.
    const down = florets > 1 ? k / florets : 0;
    const out = florets > 1 ? 0.016 : 0;
    const angle = k * 2.4;
    const at: Point = [Math.cos(angle) * out, shape.height * (1 - 0.45 * down), Math.sin(angle) * out];
    addHead(soup, at, shape, florets > 1 ? 0.6 + 0.5 * down : 1, angle);
  }
  return soup.build();
}

function addStem(soup: TriangleSoup, height: number, colour: THREE.Color): void {
  const ring = (radius: number, y: number): Point[] =>
    [0, 1, 2].map((k) => [Math.cos(k * 2.094) * radius, y, Math.sin(k * 2.094) * radius]);
  const low = ring(0.007, 0);
  const high = ring(0.004, height);
  for (let k = 0; k < 3; k++) {
    const next = (k + 1) % 3;
    soup.add(low[k], high[k], high[next], colour);
    soup.add(low[k], high[next], low[next], colour);
  }
}

/** A leaf from the stem at height `y`, rising outwards along `angle`. */
function addLeaf(soup: TriangleSoup, angle: number, y: number, colour: THREE.Color): void {
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  const at = (along: number, across: number, up: number): Point => [
    c * along - s * across,
    y + up,
    s * along + c * across,
  ];
  soup.add(at(0, 0, 0), at(0.05, 0.014, 0.035), at(0.05, -0.014, 0.035), colour, true);
  soup.add(at(0.05, 0.014, 0.035), at(0.11, 0, 0.05), at(0.05, -0.014, 0.035), colour, true);
}

/** Petals round a centre disc at `at`, `turn` rotating the whole head about the stem. */
function addHead(soup: TriangleSoup, at: Point, shape: FlowerShape, size: number, turn: number): void {
  const petal = new THREE.Color(shape.petal);
  const centre = new THREE.Color(shape.centre);
  const inner = shape.centreSize * 0.7 * size;
  const length = shape.length * size;
  const point = (angle: number, reach: number, across: number, cup: number): Point => {
    const flat = inner + reach * length * Math.cos(cup);
    return [
      at[0] + Math.cos(angle) * flat - Math.sin(angle) * across,
      at[1] + reach * length * Math.sin(cup),
      at[2] + Math.sin(angle) * flat + Math.cos(angle) * across,
    ];
  };
  for (let k = 0; k < shape.petals; k++) {
    // Petals are not quite evenly spaced or equally lifted, like a real flower.
    const angle = turn + ((k + 0.18 * Math.sin(k * 5.1)) / shape.petals) * Math.PI * 2;
    const cup = shape.cup * (0.85 + 0.3 * Math.abs(Math.sin(k * 3.3)));
    const half = (shape.width * size) / 2;
    const base = point(angle, 0, 0, cup);
    const left = point(angle, 0.6, half, cup);
    const right = point(angle, 0.6, -half, cup);
    // The outer half of a petal flattens out, so cupped flowers open at the rim.
    const tip = point(angle, 1, 0, cup * 0.7);
    soup.add(base, left, right, petal, true);
    soup.add(left, tip, right, petal, true);
  }
  const radius = shape.centreSize * size;
  const top: Point = [at[0], at[1] + radius * 0.7, at[2]];
  for (let k = 0; k < 6; k++) {
    const rim = (i: number): Point => [
      at[0] + Math.cos(i * 1.0472) * radius,
      at[1] + radius * 0.1,
      at[2] + Math.sin(i * 1.0472) * radius,
    ];
    soup.add(top, rim(k), rim(k + 1), centre, true);
  }
}
