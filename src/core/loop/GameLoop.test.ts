import { GameLoop } from './GameLoop';
import type { System } from '../ecs/System';

const recorder = () => {
  const calls: number[] = [];
  const system: System = { update: (dt) => calls.push(dt) };
  return { calls, system };
};
const noScheduler = { request: () => 0, cancel: () => undefined };

describe('GameLoop', () => {
  it('runs fixed systems at a constant step regardless of frame time', () => {
    const fixed = recorder();
    const loop = new GameLoop(noScheduler, { fixedSystems: [fixed.system], frameSystems: [], fixedDt: 0.01 });
    loop.tick(0);
    loop.tick(35); // 35 ms: 3 steps, 5 ms carried over
    expect(fixed.calls).toEqual([0.01, 0.01, 0.01]);
    loop.tick(40); // +5 ms: carried 5 + 5 = 10 ms, 1 step
    expect(fixed.calls).toHaveLength(4);
  });

  it('runs frame systems once per tick with the real frame delta', () => {
    const frame = recorder();
    const loop = new GameLoop(noScheduler, { fixedSystems: [], frameSystems: [frame.system] });
    loop.tick(1000);
    loop.tick(1016);
    expect(frame.calls[1]).toBeCloseTo(0.016);
  });

  it('caps the steps after a long stall', () => {
    const fixed = recorder();
    const loop = new GameLoop(noScheduler, {
      fixedSystems: [fixed.system],
      frameSystems: [],
      fixedDt: 0.01,
      maxStepsPerFrame: 4,
    });
    loop.tick(0);
    loop.tick(5000);
    expect(fixed.calls).toHaveLength(4);
  });
});
