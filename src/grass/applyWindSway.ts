import type * as THREE from 'three';
import type { WindSway } from './WindSway';

/**
 * Patches a material's vertex shader so vertices bend with the wind, more the higher they sit
 * above the blade base (local y). Phase varies per instance via its world position.
 */
export function applyWindSway(material: THREE.MeshStandardMaterial, wind: WindSway, strength: number): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = wind.time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWindTime;')
      .replace(
        '#include <begin_vertex>',
        [
          '#include <begin_vertex>',
          '#ifdef USE_INSTANCING',
          '  vec2 windBase = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);',
          '#else',
          '  vec2 windBase = vec2(0.0);',
          '#endif',
          '  float windPhase = uWindTime * 1.7 + windBase.x * 0.21 + windBase.y * 0.17;',
          `  float windBend = position.y * position.y * ${strength.toFixed(3)};`,
          '  transformed.x += (sin(windPhase) + 0.35 * sin(windPhase * 2.3)) * windBend;',
          '  transformed.z += cos(windPhase * 0.8) * 0.5 * windBend;',
        ].join('\n'),
      );
  };
}
