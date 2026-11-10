import { SeededRandom } from '@core';
import type { Navigator } from '@navigation';
import { createTownsfolk } from './Townsfolk';
import { wanderStep } from './wanderStep';

/** Routes go around a corner at (10, 0) to the target (10, 10); `findPath` can be switched off. */
function fakeNavigator(reachable = true): Navigator & { plans: number } {
  return {
    plans: 0,
    findPath() {
      this.plans++;
      return reachable
        ? [
            { x: 10, z: 0 },
            { x: 10, z: 10 },
          ]
        : null;
    },
    randomPoint: () => ({ x: 10, z: 10 }),
  };
}

const speed = (folk: { moveX: number; moveZ: number }) => Math.hypot(folk.moveX, folk.moveZ);

describe('wanderStep', () => {
  it('stands still while idle, then walks towards the first waypoint at walking speed', () => {
    const folk = createTownsfolk(1.5, 1);
    const navigator = fakeNavigator();
    const random = new SeededRandom(2);
    wanderStep(folk, 0, 0, 0.5, navigator, random);
    expect(folk.state).toBe('idle');
    expect(speed(folk)).toBe(0);
    wanderStep(folk, 0, 0, 0.6, navigator, random);
    expect(folk.state).toBe('walking');
    expect(folk.moveX).toBeCloseTo(1.5);
    expect(folk.moveZ).toBeCloseTo(0);
  });

  it('turns at each waypoint and goes idle for a while at the last one', () => {
    const folk = createTownsfolk(1.5, 0);
    const navigator = fakeNavigator();
    const random = new SeededRandom(3);
    wanderStep(folk, 0, 0, 0.1, navigator, random);
    wanderStep(folk, 9.9, 0, 0.1, navigator, random); // at the corner: head for the target
    expect(folk.moveX).toBeCloseTo(0, 1);
    expect(folk.moveZ).toBeCloseTo(1.5, 1);
    wanderStep(folk, 10, 9.9, 0.1, navigator, random);
    expect(folk.state).toBe('idle');
    expect(speed(folk)).toBe(0);
    expect(folk.timer).toBeGreaterThanOrEqual(folk.minIdle);
    expect(folk.timer).toBeLessThan(folk.maxIdle);
  });

  it('plans a fresh route when blocked, then gives up', () => {
    const folk = createTownsfolk(1.5, 0);
    const navigator = fakeNavigator();
    const random = new SeededRandom(4);
    wanderStep(folk, 0, 0, 0.1, navigator, random);
    expect(navigator.plans).toBe(1);
    let steps = 0;
    while (folk.state === 'walking' && steps++ < 1000) wanderStep(folk, 0, 0, 1 / 60, navigator, random);
    expect(folk.state).toBe('idle');
    expect(navigator.plans).toBe(3);
    expect(steps).toBeLessThan(60 * 4);
  });

  it('keeps walking while it makes progress', () => {
    const folk = createTownsfolk(1.5, 0);
    const navigator = fakeNavigator();
    const random = new SeededRandom(5);
    let x = 0;
    for (let i = 0; i < 300; i++) {
      wanderStep(folk, x, 0, 1 / 60, navigator, random);
      x += folk.moveX / 60;
    }
    expect(navigator.plans).toBe(1);
    expect(folk.state).toBe('walking');
  });

  it('waits and tries again later when there is no route', () => {
    const folk = createTownsfolk(1.5, 0);
    wanderStep(folk, 0, 0, 0.1, fakeNavigator(false), new SeededRandom(6));
    expect(folk.state).toBe('idle');
    expect(folk.timer).toBeGreaterThan(0);
  });
});
