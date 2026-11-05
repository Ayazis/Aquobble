import { SeededRandom } from '@core';
import { FractalNoise } from './noise/FractalNoise';
import { ValueNoise } from './noise/ValueNoise';
import { DEFAULT_TERRAIN } from './TerrainConfig';
import { TerrainGenerator } from './TerrainGenerator';

const generate = (seed: number) =>
  new TerrainGenerator(new FractalNoise(new ValueNoise(new SeededRandom(seed))), DEFAULT_TERRAIN).generate();

describe('TerrainGenerator', () => {
  it('is deterministic for a seed', () => {
    expect(generate(7).heights).toEqual(generate(7).heights);
  });

  it('differs between seeds', () => {
    expect(generate(7).heights).not.toEqual(generate(8).heights);
  });

  it('makes an island: corners sit below water, something rises above it', () => {
    const field = generate(7);
    const half = DEFAULT_TERRAIN.size / 2;
    expect(field.heightAt(-half, -half)).toBeLessThan(0);
    expect(field.heightAt(half, half)).toBeLessThan(0);
    expect(Math.max(...field.heights)).toBeGreaterThan(5);
  });
});
