/** Small things drifting in the air: butterflies by day, fireflies at dusk, dust motes in the sun. */
export type SwarmKind = 'butterfly' | 'firefly' | 'mote';

/** One member of a swarm: where it hovers around, and its own phase and pace. Pure data. */
export interface SwarmMember {
  x: number;
  y: number;
  z: number;
  /** How far (m) it wanders from its home. */
  radius: number;
  phase: number;
  speed: number;
}
