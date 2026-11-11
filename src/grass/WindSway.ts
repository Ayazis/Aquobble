import { createWindUniforms, type WindUniforms } from '@wind';
import { createBendUniforms, type BendUniforms } from './BendUniforms';

/**
 * Shader uniforms for swaying plants: the shared wind (`@wind`, kept current by `WindSystem`), the bend map
 * (trampling, kept current by `GrassBendSystem`) and `time`, the ground fur's drift clock that
 * `WindSwaySystem` advances. Plant materials read these objects when they compile, so swap in the shared
 * ones (`linkGrassWind`) before the first frame.
 */
export interface WindSway {
  time: { value: number };
  wind: WindUniforms;
  bend: BendUniforms;
}

/** Fresh uniforms: still air and a blank bend map. */
export function createWindSway(): WindSway {
  return { time: { value: 0 }, wind: createWindUniforms(), bend: createBendUniforms() };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    windSway?: WindSway;
  }
}
