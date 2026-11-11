import type * as THREE from 'three';
import { CROWN_RIM_FRAGMENT } from './crownRimChunk';

const ANCHOR = '#include <opaque_fragment>';

/** Adds the sun-side rim (5.4) to a crown material, after any earlier shader patch (surface detail, sway). */
export function applyCrownRim(material: THREE.Material): void {
  const before = material.onBeforeCompile.bind(material);
  const key = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    before(shader, renderer);
    shader.fragmentShader = shader.fragmentShader.replace(ANCHOR, `${CROWN_RIM_FRAGMENT}\n${ANCHOR}`);
  };
  material.customProgramCacheKey = () => `${key}-crown-rim`;
  material.needsUpdate = true;
}
