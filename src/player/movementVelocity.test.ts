import { movementVelocity } from './movementVelocity';
import { idleInput, type PlayerInput } from './PlayerInput';

const input = (patch: Partial<PlayerInput>): PlayerInput => ({ ...idleInput(), ...patch });

describe('movementVelocity', () => {
  it('is zero without input', () => {
    expect(movementVelocity(idleInput(), 1.2, 4, 8)).toEqual({ x: 0, z: 0 });
  });

  it('moves forward along -z at yaw 0 and right along +x', () => {
    const forward = movementVelocity(input({ forward: 1 }), 0, 4, 8);
    expect(forward.x).toBeCloseTo(0);
    expect(forward.z).toBeCloseTo(-4);
    const right = movementVelocity(input({ right: 1 }), 0, 4, 8);
    expect(right.x).toBeCloseTo(4);
    expect(right.z).toBeCloseTo(0);
  });

  it('follows the camera yaw (yaw +90° looks along -x)', () => {
    const v = movementVelocity(input({ forward: 1 }), Math.PI / 2, 4, 8);
    expect(v.x).toBeCloseTo(-4);
    expect(v.z).toBeCloseTo(0);
  });

  it('runs at run speed and does not go faster diagonally', () => {
    const v = movementVelocity(input({ forward: 1, right: 1, run: true }), 0.4, 4, 8);
    expect(Math.hypot(v.x, v.z)).toBeCloseTo(8);
  });
});
