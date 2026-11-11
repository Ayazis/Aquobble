import { createGameWorld, identityQuat, vec3 } from '@core';
import { GerstnerWaveField } from './GerstnerWaveField';
import { SeaAndPonds } from './SeaAndPonds';
import { dryContact } from './WaterContact';
import { WaterContactSystem } from './WaterContactSystem';
import { waveShoaling } from './waveShoaling';

/** Ground slopes down into the sea along +x: dry for x < 0, deeper further out. */
const ground = { heightAt: (x: number) => -x * 0.5 };
const water = new SeaAndPonds(ground, 0, new GerstnerWaveField([]), { value: 0 }, [
  { x: -20, z: 0, radius: 3, level: 5 },
]);

describe('WaterContactSystem', () => {
  it('reports entering, depth, speed and leaving', () => {
    const world = createGameWorld();
    const transform = { position: vec3(-4, 3, 0), rotation: identityQuat() };
    const entity = world.add({
      transform,
      waterContact: dryContact(1, transform.position),
      buoyant: { points: [], volume: 1, halfHeight: 1, drag: 1 },
    });
    const system = new WaterContactSystem(world, water);
    system.update(1);
    expect(entity.waterContact?.inWater).toBe(false);

    transform.position.x = 4; // ground -2, feet at -0.5
    transform.position.y = 0.5;
    system.update(1);
    const c = entity.waterContact ?? dryContact(0, transform.position);
    expect(c.entered).toBe(true);
    expect(c.depth).toBeCloseTo(2);
    expect(c.immersion).toBeCloseTo(0.5);
    expect(c.speed).toBeCloseTo(8);

    system.update(1);
    expect(c.entered).toBe(false);
    transform.position.x = -4;
    system.update(1);
    expect(c.left).toBe(true);
    expect(c.inWater).toBe(false);
  });

  it('finds the calm pond level inside a pond', () => {
    expect(water.surfaceAt(-20, 1)).toBe(5);
    expect(water.surfaceAt(10, 0)).toBe(0);
  });
});

describe('waveShoaling', () => {
  it('shortens and raises waves in shallow water, flattens them at the shore and far out', () => {
    expect(waveShoaling(10, 0)).toEqual({ kScale: 1, ampScale: 1 });
    const shallow = waveShoaling(1.5, 0);
    expect(shallow.kScale).toBeGreaterThan(1);
    expect(shallow.ampScale).toBeGreaterThan(1);
    expect(waveShoaling(0, 0).ampScale).toBe(0);
    expect(waveShoaling(10, 200).ampScale).toBe(0);
  });
});
