/** Max characters that can bend grass at once (size of the shader's bender array). */
export const MAX_GRASS_BENDERS = 16;

/**
 * Shared shader uniforms for swaying plants. `WindSwaySystem` advances the time; `GrassBendSystem`
 * packs nearby characters into `benders` as (x, y, z, radius) quadruples (radius 0 = unused slot).
 */
export interface WindSway {
  time: { value: number };
  benders: { value: Float32Array };
}

/** Fresh uniforms with no benders. */
export function createWindSway(): WindSway {
  return { time: { value: 0 }, benders: { value: new Float32Array(MAX_GRASS_BENDERS * 4) } };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    windSway?: WindSway;
  }
}
