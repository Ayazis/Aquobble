import type { SwarmKind, SwarmMember } from './SwarmKind';

/** Where a member is at time `t`, which way it faces, and its flap (butterfly) or glow (firefly) in [0, 1]. */
export interface SwarmPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pulse: number;
}

function place(kind: SwarmKind, m: SwarmMember, t: number, out: SwarmPose): void {
  const s = t * m.speed + m.phase;
  if (kind === 'mote') {
    // Rises slowly through a sunbeam, then starts again at the bottom.
    const rise = (s * 0.04) % 1;
    out.x = m.x + Math.sin(s * 0.3) * m.radius;
    out.y = m.y + rise * 3;
    out.z = m.z + Math.cos(s * 0.23) * m.radius;
    return;
  }
  const lift = kind === 'butterfly' ? 0.35 : 0.5;
  out.x = m.x + m.radius * (Math.sin(s * 0.7) + 0.4 * Math.sin(s * 1.9 + m.phase));
  out.y = m.y + lift * Math.sin(s * 2.3);
  out.z = m.z + m.radius * (Math.cos(s * 0.53) + 0.4 * Math.cos(s * 1.7 + m.phase));
}

/** Pure: a member's pose, from its home and the clock alone, so swarms need no simulation state. */
export function swarmPose(kind: SwarmKind, m: SwarmMember, t: number, out: SwarmPose): SwarmPose {
  place(kind, m, t + 0.05, out);
  const ax = out.x;
  const az = out.z;
  place(kind, m, t, out);
  out.yaw = Math.atan2(ax - out.x, az - out.z);
  if (kind === 'butterfly') out.pulse = Math.abs(Math.sin(t * 16 + m.phase * 7));
  else if (kind === 'firefly') out.pulse = Math.max(Math.sin(t * 1.3 * m.speed + m.phase * 5), 0) ** 3;
  else out.pulse = 1;
  return out;
}

const smooth = (a: number, b: number, v: number): number => {
  const k = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return k * k * (3 - 2 * k);
};

/** How much of a swarm shows, from how dark it is (0 day, 1 night): butterflies and motes by day, fireflies at dusk. */
export function swarmVisibility(kind: SwarmKind, night: number): number {
  if (kind === 'firefly') return smooth(0.35, 0.75, night);
  return 1 - smooth(0.2, 0.55, night);
}
