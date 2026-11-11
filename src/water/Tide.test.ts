import { describe, expect, it } from 'vitest';
import { SeaAndPonds } from './SeaAndPonds';
import { Tide, TIDE, tideOffset } from './Tide';

const flat = { waveHeightAt: () => 0, waveNormalAt: () => ({ x: 0, y: 1, z: 0 }) };

describe('Tide', () => {
  it('rises and falls twice a day within its amplitude', () => {
    expect(tideOffset(0)).toBeCloseTo(0);
    expect(tideOffset(0.125)).toBeCloseTo(TIDE.amplitude);
    expect(tideOffset(0.375)).toBeCloseTo(-TIDE.amplitude);
    expect(tideOffset(0.625)).toBeCloseTo(TIDE.amplitude);
    for (let t = 0; t < 1; t += 0.01) expect(Math.abs(tideOffset(t))).toBeLessThanOrEqual(TIDE.amplitude + 1e-9);
  });

  it('keeps the sand wet above a falling tide and dries it slowly', () => {
    const tide = new Tide(0.2);
    tide.advance(0.125);
    expect(tide.waterLine.value).toBeCloseTo(0.2 + TIDE.amplitude);
    for (let t = 0.125; t <= 0.25; t += 0.005) tide.advance(t);
    expect(tide.wetLine.value).toBeGreaterThan(tide.waterLine.value);
    expect(tide.wetLine.value).toBeLessThan(0.2 + TIDE.amplitude);
  });

  it('wet line never sits below the water and follows a rising tide', () => {
    const tide = new Tide(0);
    for (let t = 0.375; t <= 0.625; t += 0.01) {
      tide.advance(t);
      expect(tide.wetLine.value).toBeGreaterThanOrEqual(tide.waterLine.value - 1e-9);
    }
  });

  it('raises the sea for simulation but leaves ponds alone', () => {
    const tide = new Tide(0.2);
    tide.advance(0.125);
    const pond = { x: 50, z: 50, radius: 5, level: 3 };
    const ground = { heightAt: () => -5 };
    const water = new SeaAndPonds(ground, 0.2, flat, { value: 0 }, [pond], tide.offset);
    expect(water.surfaceAt(0, 0)).toBeCloseTo(0.2 + TIDE.amplitude);
    expect(water.surfaceAt(50, 50)).toBe(3);
  });
});
