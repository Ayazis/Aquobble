import { FpsCounter } from './FpsCounter';

describe('FpsCounter', () => {
  it('reports the average frame rate once the window is full', () => {
    const counter = new FpsCounter(0.5);
    const results = Array.from({ length: 40 }, () => counter.sample(1 / 60)); // ~0.67 s: one full window
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(counter.fps).toBeCloseTo(60, 0);
  });

  it('tracks the slowest frame in the window', () => {
    const counter = new FpsCounter(0.5);
    for (let i = 0; i < 30; i++) counter.sample(i === 5 ? 0.1 : 1 / 60); // window fills around frame 24
    expect(counter.worstFrameMs).toBeCloseTo(100);
  });

  it('ignores zero-length frames (the first loop tick)', () => {
    const counter = new FpsCounter(0.5);
    expect(counter.sample(0)).toBe(false);
    expect(counter.fps).toBe(0);
  });
});
