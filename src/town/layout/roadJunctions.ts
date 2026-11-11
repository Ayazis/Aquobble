import type { GroundPoint } from './GroundPoint';
import type { RoadNetwork } from './RoadNetwork';
import type { WallSide } from './TownWall';

const NEAR = 0.05;

/** Distance from a point to the square's outline. */
export function distanceToSquareEdge(network: RoadNetwork, p: GroundPoint): number {
  const { square } = network;
  let best = Infinity;
  for (let i = 0; i < square.length; i++) {
    const [a, b] = [square[i], square[(i + 1) % square.length]];
    const [ex, ez] = [b.x - a.x, b.z - a.z];
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * ex + (p.z - a.z) * ez) / (ex * ex + ez * ez)));
    best = Math.min(best, Math.hypot(p.x - a.x - ex * t, p.z - a.z - ez * t));
  }
  return best;
}

/** True inside the square polygon (even-odd rule). */
export function insideSquare(network: RoadNetwork, p: GroundPoint): boolean {
  const { square } = network;
  let inside = false;
  for (let i = 0, j = square.length - 1; i < square.length; j = i++) {
    const [a, b] = [square[i], square[j]];
    if (a.z > p.z !== b.z > p.z && p.x < ((b.x - a.x) * (p.z - a.z)) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}

/** Where streets meet the square or each other: every street end that touches the square or another street. */
export function junctions(network: RoadNetwork): GroundPoint[] {
  const found: GroundPoint[] = [];
  const ends = network.streets.flatMap((s) => [s.points[0], s.points[s.points.length - 1]]);
  for (const p of ends) {
    const onSquare = distanceToSquareEdge(network, p) < NEAR;
    const shared = ends.filter((q) => Math.hypot(q.x - p.x, q.z - p.z) < NEAR).length > 1;
    if ((onSquare || shared) && !found.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < NEAR)) found.push(p);
  }
  return found;
}

/** The point where each gated street runs out through its gate. */
export function gateEnds(network: RoadNetwork): { gate: WallSide; point: GroundPoint }[] {
  return network.streets.flatMap((s) => (s.gate ? [{ gate: s.gate, point: s.points[s.points.length - 1] }] : []));
}
