import type { WindDirection } from '@wind';
import type { GerstnerWave } from './GerstnerWave';

/** Angle off the wind (radians), wavelength (m), amplitude (m) and phase of the five default waves. */
const SPECTRUM: readonly [number, number, number, number][] = [
  [0, 9, 0.07, 0],
  [0.45, 6, 0.045, 1.3],
  [-0.6, 4.2, 0.03, 2.1],
  [0.95, 2.7, 0.018, 4.0],
  [-1.2, 1.8, 0.01, 5.2],
];

/** Five Gerstner waves fanned around the wind direction; `scale` multiplies all amplitudes (e.g. wind strength). */
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
