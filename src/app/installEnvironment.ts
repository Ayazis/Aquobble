import { SeededRandom } from '@core';
import { Environment, type DayNightSystem } from '@environment';
import { installToonLighting, type ColorGrade, type RenderContext } from '@rendering';
import type { GameConfig } from './GameConfig';

/**
 * Cel-shaded lighting plus sky, sun and clouds, with the clouds shading the ground. Call before the first
 * frame compiles any shader; the colour grade follows the hour.
 */
export function installEnvironment(config: GameConfig, render: RenderContext, grade: ColorGrade): DayNightSystem {
  const cloudShadow = installToonLighting();
  const environment = new Environment(config.environment);
  return environment.install(render, new SeededRandom(config.seed + 303), grade, cloudShadow);
}
