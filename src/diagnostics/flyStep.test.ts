import { flyStep } from './flyStep';

describe('flyStep', () => {
  it('moves position and target together along the view direction', () => {
    const position = { x: 0, y: 2, z: 0 };
    const target = { x: 0, y: 2, z: -10 };
    flyStep(position, target, { forward: 1, right: 0, up: 0 }, 3);
    expect(position).toEqual({ x: 0, y: 2, z: -3 });
    expect(target).toEqual({ x: 0, y: 2, z: -13 });
  });

  it('strafes to the right of the view direction and rises along world up', () => {
    const position = { x: 0, y: 0, z: 0 };
    const target = { x: 0, y: -5, z: -10 };
    flyStep(position, target, { forward: 0, right: 1, up: 1 }, 2);
    expect(position.x).toBeCloseTo(2);
    expect(position.y).toBeCloseTo(2);
    expect(position.z).toBeCloseTo(0);
  });
});
