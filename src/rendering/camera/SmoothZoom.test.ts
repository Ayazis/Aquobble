import { SmoothZoom } from './SmoothZoom';

const options = { minDistance: 10, maxDistance: 100, responsiveness: 10, wheelSensitivity: 0.01 };

/** Runs frames at 60 fps, feeding back the distance the zoom asked for. */
const run = (zoom: SmoothZoom, start: number, frames: number) => {
  let distance = start;
  const history: number[] = [];
  for (let i = 0; i < frames; i++) history.push((distance = zoom.update(1 / 60, distance)));
  return history;
};

describe('SmoothZoom', () => {
  it('eases toward the target over several frames instead of jumping', () => {
    const zoom = new SmoothZoom(options);
    zoom.update(1 / 60, 50);
    zoom.addWheel(50); // target = 50 * e^0.5 ≈ 82.4
    const history = run(zoom, 50, 60);
    expect(history[0]).toBeGreaterThan(50);
    expect(history[0]).toBeLessThan(65);
    for (let i = 1; i < history.length; i++) expect(history[i]).toBeGreaterThanOrEqual(history[i - 1]);
    expect(history.at(-1)).toBeCloseTo(50 * Math.exp(0.5), 0);
  });

  it('accumulates rapid wheel ticks into one smooth target', () => {
    const zoom = new SmoothZoom(options);
    zoom.update(1 / 60, 50);
    zoom.addWheel(-20);
    zoom.addWheel(-20);
    const history = run(zoom, 50, 120);
    expect(history.at(-1)).toBeCloseTo(50 * Math.exp(-0.4), 0);
  });

  it('clamps to the distance limits', () => {
    const zoom = new SmoothZoom(options);
    zoom.update(1 / 60, 50);
    zoom.addWheel(10_000);
    expect(run(zoom, 50, 300).at(-1)).toBeCloseTo(100, 0);
  });

  it('follows the real distance while idle (e.g. after a pinch)', () => {
    const zoom = new SmoothZoom(options);
    zoom.update(1 / 60, 50);
    expect(zoom.update(1 / 60, 30)).toBe(30);
  });
});
