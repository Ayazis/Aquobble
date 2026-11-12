import { SeededRandom } from '@core';
import { Environment, type DayNightSystem } from '@environment';
import {
  installSceneLighting,
  type ColorGrade,
  type LightShafts,
  type RenderContext,
  type SceneLighting,
} from '@rendering';
import type { HemisphereLight } from 'three';
import type { GameConfig } from './GameConfig';

/** What the environment hands on: the day cycle, the shared lighting values and the sky/ground fill light. */
export interface InstalledEnvironment {
  dayNight: DayNightSystem;
  lighting: SceneLighting;
  fill: HemisphereLight;
}

/**
 * The shared lighting patch plus sky, sun and clouds, with the clouds shading the ground. Call before the first
 * frame compiles any shader; the colour grade follows the hour.
 */
export function installEnvironment(
  config: GameConfig,
  render: RenderContext,
  grade: ColorGrade & LightShafts,
): InstalledEnvironment {
  const lighting = installSceneLighting(render.quality.cloudShadows);
  const environment = new Environment(config.environment);
  const dayNight = environment.install(render, new SeededRandom(config.seed + 303), grade, lighting.cloudShadow);
  if (!environment.sunLight) throw new Error('Environment did not create its sun light.');
  return { dayNight, lighting, fill: environment.sunLight.fill };
}
