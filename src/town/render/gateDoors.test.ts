import { describe, expect, it } from 'vitest';
import { gateArch } from './gateArch';
import { gateDoors } from './gateDoors';

const wall = { halfSize: 24, thickness: 1.4, height: 3.5, gates: [{ side: 'north' as const, width: 4 }] };

describe('gateDoors', () => {
  it('opens two leaves inside the town, clear of the gate opening', () => {
    const { wood } = gateDoors(wall);
    expect(wood).toHaveLength(2);
    for (const leaf of wood) {
      expect(leaf.center.z + leaf.half.z).toBeLessThanOrEqual(wall.halfSize - wall.thickness / 2);
      // Against the passage sides: the middle of the gate stays open.
      expect(Math.abs(leaf.center.x) - leaf.half.x).toBeGreaterThan(wall.gates[0].width / 2 - 0.3);
    }
  });

  it('keeps the arch head-high and under the lintel', () => {
    const arch = gateArch(wall, wall.gates[0]);
    expect(arch.springing).toBeGreaterThan(2);
    expect(arch.springing).toBeLessThan(arch.top);
  });
});
