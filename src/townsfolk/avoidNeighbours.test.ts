import { avoidNeighbours } from './avoidNeighbours';
import { createTownsfolk } from './Townsfolk';

const walker = (moveX: number, moveZ: number) => Object.assign(createTownsfolk(1.5, 0), { moveX, moveZ });

describe('avoidNeighbours', () => {
  it('leaves a walker with nobody near alone', () => {
    const folk = walker(1.5, 0);
    const self = { x: 0, z: 0 };
    avoidNeighbours(folk, self, [self, { x: 5, z: 0 }]);
    expect(folk).toMatchObject({ moveX: 1.5, moveZ: 0 });
  });

  it('swerves around someone ahead without changing speed', () => {
    const folk = walker(1.5, 0);
    const self = { x: 0, z: 0 };
    avoidNeighbours(folk, self, [self, { x: 1, z: 0 }]);
    expect(folk.moveZ).not.toBe(0);
    expect(Math.hypot(folk.moveX, folk.moveZ)).toBeCloseTo(1.5);
  });

  it('makes two walkers meeting head-on pass on opposite sides', () => {
    const a = walker(1.5, 0);
    const b = walker(-1.5, 0);
    const pa = { x: 0, z: 0 };
    const pb = { x: 1, z: 0 };
    avoidNeighbours(a, pa, [pa, pb]);
    avoidNeighbours(b, pb, [pa, pb]);
    expect(Math.sign(a.moveZ)).toBe(-Math.sign(b.moveZ));
  });

  it('ignores someone behind, and anyone at all while standing', () => {
    const folk = walker(1.5, 0);
    const self = { x: 0, z: 0 };
    avoidNeighbours(folk, self, [{ x: -1, z: 0 }]);
    expect(folk).toMatchObject({ moveX: 1.5, moveZ: 0 });
    const idle = walker(0, 0);
    avoidNeighbours(idle, self, [{ x: 1, z: 0 }]);
    expect(idle).toMatchObject({ moveX: 0, moveZ: 0 });
  });
});
