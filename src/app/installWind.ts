import type { Random } from '@core';
import { createWindUniforms, SeededWind, WindSystem, type Wind, type WindUniforms } from '@wind';

/** The shared wind: one field for CPU code, one uniform set for shaders, one system that keeps them in step. */
export interface InstalledWind {
  wind: Wind;
  uniforms: WindUniforms;
  system: WindSystem;
}

/** `timeOfDay` returns the day cycle's time in [0, 1) (`DayNightSystem.timeOfDay`). */
export function installWind(random: Random, timeOfDay: () => number, boost?: () => number): InstalledWind {
  const wind = new SeededWind(random.fork('wind'), () => timeOfDay() * 24, boost); // lane G: weather boost
  const uniforms = createWindUniforms();
  return { wind, uniforms, system: new WindSystem(wind, uniforms, wind.fronts) };
}
