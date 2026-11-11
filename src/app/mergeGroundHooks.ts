import type { TerrainGroundHook } from '@terrain';

/** Several ground shader hooks as one: uniforms and declarations joined, main chunks run in order. */
export function mergeGroundHooks(...hooks: TerrainGroundHook[]): TerrainGroundHook {
  return {
    uniforms: Object.assign({}, ...hooks.map((h) => h.uniforms)),
    fragmentPars: hooks.map((h) => h.fragmentPars).join('\n'),
    fragmentMain: hooks.map((h) => h.fragmentMain).join('\n'),
  };
}
