import type * as THREE from 'three';
import type { WindSway } from './WindSway';
import { WIND_UNIFORMS, windProjectVertex } from './windShaderChunk';

export interface WindSwayLook {
  /** How far the tip bends per (local height)^2. */
  strength: number;
  /** Camera distance where plants start shrinking away, and where they are gone. */
  fadeStart: number;
  fadeEnd: number;
  /** Optional camera distance range over which near plants grow in (hidden closer than its start). */
  fadeIn?: readonly [number, number];
}

/** Patches a material's vertex shader so its plants sway in the wind and bend away from characters. */
export function applyWindSway(material: THREE.Material, wind: WindSway, look: WindSwayLook): void {
  // Each look compiles its own program; without a key, materials with different fades would share one.
  const key = `aquobble-wind-${look.strength}-${look.fadeStart}-${look.fadeEnd}-${look.fadeIn?.join(',') ?? ''}`;
  material.customProgramCacheKey = () => key;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = wind.time;
    shader.uniforms.uBenders = wind.benders;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WIND_UNIFORMS}`)
      .replace(
        '#include <project_vertex>',
        windProjectVertex(look.strength, look.fadeStart, look.fadeEnd, look.fadeIn),
      );
  };
}
