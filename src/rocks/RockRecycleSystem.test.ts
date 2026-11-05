import { createGameWorld, identityQuat, SeededRandom, vec3, type GameWorld, type Vec3 } from '@core';
import { RockRecycleSystem } from './RockRecycleSystem';
import type { RockSpawner } from './RockSpawner';

/** Fake spawner: adds plain rock entities without physics or meshes. */
const fakeSpawner = (world: GameWorld) =>
  ({
    spawn: (position: Vec3, radius: number) =>
      world.add({ rock: { radius }, transform: { position: { ...position }, rotation: identityQuat() } }),
  }) as unknown as RockSpawner;

const options = { population: 3, removeBelow: -20, dropExtent: 10, dropHeight: 40 };

describe('RockRecycleSystem', () => {
  it('tops the population up one rock per tick', () => {
    const world = createGameWorld();
    const system = new RockRecycleSystem(world, fakeSpawner(world), new SeededRandom(1), options);
    system.update();
    system.update();
    expect(world.with('rock').size).toBe(2);
    system.update();
    system.update();
    expect(world.with('rock').size).toBe(3);
  });

  it('removes rocks that fell below the limit', () => {
    const world = createGameWorld();
    const sunk = world.add({ rock: { radius: 1 }, transform: { position: vec3(0, -50, 0), rotation: identityQuat() } });
    new RockRecycleSystem(world, fakeSpawner(world), new SeededRandom(1), options).update();
    expect(world.has(sunk)).toBe(false);
  });
});
