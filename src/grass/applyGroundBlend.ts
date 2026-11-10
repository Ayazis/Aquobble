import type * as THREE from 'three';
import { LUSH_GROUND_GLSL } from '@terrain';

export interface GroundBlendLook {
  /** Camera distance where tips start taking the ground colour, and where the whole tuft has it. */
  tipFadeStart: number;
  tipFadeEnd: number;
}

/**
 * Patches a grass material (after `applyWindSway`) so each tuft runs from the ground colour at its root to
 * its instance colour at the tip; the geometry's vertex colour red channel is the blend weight. Far tufts
 * turn fully ground-coloured before they shrink away, and both faces of a blade are lit alike.
 */
export function applyGroundBlend(material: THREE.Material, look: GroundBlendLook): void {
  const before = material.onBeforeCompile.bind(material);
  const fade = `${look.tipFadeStart.toFixed(1)}, ${look.tipFadeEnd.toFixed(1)}`;
  material.onBeforeCompile = (shader, renderer) => {
    before(shader, renderer);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${LUSH_GROUND_GLSL}`)
      .replace(
        '#include <color_vertex>',
        /* glsl */ `#include <color_vertex>
#ifdef USE_INSTANCING_COLOR
  vec3 grassRoot = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz;
  float grassTip = color.r * (1.0 - smoothstep(${fade}, distance(grassRoot, cameraPosition)));
  vColor.rgb = mix(lushGroundColor(grassRoot.y), instanceColor.rgb, grassTip);
#endif`,
      );
    // Undo three's back-face normal flip: the normals point up, so a flipped one would be lit from below.
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_begin>',
      /* glsl */ `#include <normal_fragment_begin>
#ifdef DOUBLE_SIDED
  normal *= faceDirection;
#endif`,
    );
  };
  material.customProgramCacheKey = () => `aquobble-grass-${fade}`;
}
