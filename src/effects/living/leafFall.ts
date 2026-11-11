/** One leaf torn from a crown, tumbling down on the wind. Pure data; `active` is false once it lands. */
export interface FallingLeaf {
  x: number;
  y: number;
  z: number;
  /** Ground height under where it started; it lands there. */
  groundY: number;
  phase: number;
  age: number;
  active: boolean;
}

/** Metres per second a leaf sinks, and how far it flutters sideways. */
const SINK = 0.75;
const FLUTTER = 0.5;
/** Metres per second of drift at full push. */
const DRIFT = 3;

/** Pure: one step of a falling leaf, drifting with the wind (`push` in [0, 1]) and fluttering side to side. */
export function leafFall(leaf: FallingLeaf, dt: number, windX: number, windZ: number, push: number): void {
  if (!leaf.active) return;
  leaf.age += dt;
  const flutter = Math.sin(leaf.age * 2.4 + leaf.phase) * FLUTTER;
  const drift = DRIFT * (0.25 + push);
  leaf.x += (windX * drift - windZ * flutter) * dt;
  leaf.z += (windZ * drift + windX * flutter) * dt;
  leaf.y -= SINK * (0.7 + 0.6 * Math.abs(Math.cos(leaf.age * 2.4 + leaf.phase))) * dt;
  if (leaf.y <= leaf.groundY + 0.02) leaf.active = false;
}
