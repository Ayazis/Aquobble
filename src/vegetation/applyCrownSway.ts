import type * as THREE from 'three';

/** The clock that drives the sway, shared with the grass so gusts cross both together. */
export interface CrownSwayClock {
  time: { value: number };
}

/**
 * Patches a tree-crown material (after any surface detail) so crowns sway slowly in the wind: the whole
 * crown leans with the gusts and each clump bobs a little on its own. Vertex shader only, no texture reads.
 * `baseHeight` is the local height (m) where the crown starts; nothing moves below it.
 */
export function applyCrownSway(material: THREE.Material, clock: CrownSwayClock, baseHeight: number): void {
  const before = material.onBeforeCompile.bind(material);
  const key = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    before(shader, renderer);
    shader.uniforms.uWindTime = clock.time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWindTime;')
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
#ifdef USE_INSTANCING
  vec3 crownRoot = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz;
  float crownLift = max(position.y - ${baseHeight.toFixed(2)}, 0.0);
  // The same gust front as the grass, so a gust visibly rolls from meadow into trees.
  vec2 crownWind = normalize(vec2(1.0, 0.35));
  float crownAlong = dot(crownRoot.xz, crownWind);
  float crownGust = 0.5 + 0.5 * sin(crownAlong * 0.09 - uWindTime * 1.1);
  float crownLean = (0.25 + crownGust) * (0.6 + 0.4 * sin(uWindTime * 0.9 + crownRoot.x * 0.7 + crownRoot.z * 0.5));
  // Local-space push; trees are only turned about y, so undo the instance's yaw.
  vec2 crownPush = normalize(transpose(mat3(instanceMatrix)) * vec3(crownWind.x, 0.0, crownWind.y)).xz;
  transformed.xz += crownPush * crownLean * crownLift * 0.035;
  // Each clump bobs on its own beat.
  float crownBob = sin(uWindTime * 1.7 + position.x * 1.3 + position.z * 1.1 + crownAlong);
  transformed.y += crownBob * 0.03 * min(crownLift, 1.5);
  transformed.xz += normalize(position.xz + vec2(0.001)) * crownBob * 0.025 * min(crownLift, 1.5);
#endif`,
      );
  };
  material.customProgramCacheKey = () => `${key}-crown-sway`;
  material.needsUpdate = true;
}
