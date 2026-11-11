import { describe, expect, it } from 'vitest';
import { swarmPose, swarmVisibility, type SwarmPose } from './swarmPose';

const member = { x: 10, y: 2, z: -5, radius: 1.5, phase: 0.7, speed: 1 };
const pose = (): SwarmPose => ({ x: 0, y: 0, z: 0, yaw: 0, pulse: 0 });

describe('swarmPose', () => {
  it('stays near home', () => {
    for (const kind of ['butterfly', 'firefly', 'mote'] as const) {
      for (let t = 0; t < 60; t += 0.7) {
        const p = swarmPose(kind, member, t, pose());
        expect(Math.hypot(p.x - member.x, p.z - member.z)).toBeLessThan(member.radius * 2);
        expect(p.y).toBeGreaterThan(member.y - 1);
        expect(p.y).toBeLessThan(member.y + 3.1);
        expect(p.pulse).toBeGreaterThanOrEqual(0);
        expect(p.pulse).toBeLessThanOrEqual(1);
      }
    }
  });

  it('is a pure function of time', () => {
    expect(swarmPose('butterfly', member, 3.2, pose())).toEqual(swarmPose('butterfly', member, 3.2, pose()));
  });

  it('shows butterflies by day and fireflies at night', () => {
    expect(swarmVisibility('butterfly', 0)).toBe(1);
    expect(swarmVisibility('butterfly', 1)).toBe(0);
    expect(swarmVisibility('firefly', 0)).toBe(0);
    expect(swarmVisibility('firefly', 1)).toBe(1);
  });
});
