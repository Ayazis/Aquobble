import type { WindDirection } from '@wind';
import type { GerstnerWave } from './GerstnerWave';

/**
 * Angle off the wind (radians), wavelength (m), amplitude (m) and phase of the default waves, longest first:
 * a swell that runs nearly with the wind and shorter, lower chop fanned ever wider around it. Each wave is
 * about as steep as the next (amplitude falls with length), as on a real wind sea.
 */
const SPECTRUM: readonly [number, number, number, number][] = [
  [0.08, 26, 0.105, 0],
  [-0.28, 17, 0.08, 1.3],
  [0.4, 11.5, 0.06, 2.1],
  [-0.55, 8, 0.044, 4.0],
  [0.22, 5.6, 0.032, 5.2],
  [0.85, 4.1, 0.022, 0.7],
  [-0.95, 3, 0.015, 3.3],
  [0.6, 2.2, 0.01, 2.6],
];

/** Gerstner waves fanned around the wind direction; `scale` multiplies all amplitudes. */
export function gerstnerWavesFromWind(wind: WindDirection, scale = 1, steepness = 0.6): GerstnerWave[] {
  const heading = Math.atan2(wind.z, wind.x);
  return SPECTRUM.map(([offset, wavelength, amplitude, phase]) => ({
    dirX: Math.cos(heading + offset),
    dirZ: Math.sin(heading + offset),
    wavelength,
    amplitude: amplitude * scale,
    steepness,
    phase,
  }));
}
