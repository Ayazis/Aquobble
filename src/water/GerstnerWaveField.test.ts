import { GerstnerWaveField } from './GerstnerWaveField';
import { gerstnerWavesFromWind } from './gerstnerWavesFromWind';

const wave = (steepness: number) => ({
  dirX: 1,
  dirZ: 0,
  wavelength: 2 * Math.PI,
  amplitude: 0.5,
  steepness,
  phase: 0,
});

describe('GerstnerWaveField', () => {
  it('reduces to a sine wave without steepness', () => {
    const field = new GerstnerWaveField([wave(0)]);
    // k = 1, so the crest sits at x = pi / 2 at t = 0.
    expect(field.waveHeightAt(Math.PI / 2, 3, 0)).toBeCloseTo(0.5, 6);
    expect(field.waveHeightAt(0, 0, 0)).toBeCloseTo(0, 6);
    const n = field.waveNormalAt(0, 0, 0);
    expect(n.x).toBeCloseTo(-0.5 / Math.hypot(0.5, 1), 6);
    expect(n.y).toBeCloseTo(1 / Math.hypot(0.5, 1), 6);
  });

  it('travels at deep-water speed sqrt(g / k)', () => {
    const field = new GerstnerWaveField([wave(0.8)]);
    const c = Math.sqrt(9.81);
    expect(field.waveHeightAt(1 + c * 2, 0, 2)).toBeCloseTo(field.waveHeightAt(1, 0, 0), 6);
  });

  it('sharpens crests: steep crests stay at full height, troughs widen', () => {
    const steep = new GerstnerWaveField([wave(1)]);
    expect(steep.waveHeightAt(Math.PI / 2, 0, 0)).toBeCloseTo(0.5, 4);
    // Half way between crest and trough the steep wave is lower than the sine (wider trough).
    expect(steep.waveHeightAt(Math.PI, 0, 0)).toBeLessThan(0);
  });

  it('matches pinned values for the wind-driven default waves', () => {
    const field = new GerstnerWaveField(gerstnerWavesFromWind({ x: 0.6, z: 0.8 }));
    expect(field.waveHeightAt(0, 0, 0)).toBeCloseTo(PINNED_A, 6);
    expect(field.waveHeightAt(12.5, -4, 3.25)).toBeCloseTo(PINNED_B, 6);
    const n = field.waveNormalAt(12.5, -4, 3.25);
    expect(Math.hypot(n.x, n.y, n.z)).toBeCloseTo(1, 9);
    expect(n.y).toBeGreaterThan(0.9);
  });
});

const PINNED_A = 0.08044924736347096;
const PINNED_B = 0.0601875733406535;
