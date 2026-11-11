import type * as THREE from 'three';

/** Cube shadow resolution per face: small, soft and cheap. */
const MAP_SIZE = 256;

/**
 * Lane D2: lets a lamp light cast a cube shadow so posts and passers-by throw shadows at night (desktop only).
 * The shadow is set up from the start, so switching it on later never recompiles shaders; it only redraws
 * while `setLampShadowActive` has it on.
 */
export function castLampShadow(light: THREE.PointLight): void {
  light.castShadow = true;
  light.shadow.mapSize.set(MAP_SIZE, MAP_SIZE);
  light.shadow.camera.near = 0.3;
  light.shadow.bias = -0.004;
  light.shadow.normalBias = 0.03;
  light.shadow.radius = 2;
  light.shadow.autoUpdate = false;
}

/** On: redraw the shadow every frame (the light moves between lamps). Off: keep the last map, draw nothing. */
export function setLampShadowActive(light: THREE.PointLight, on: boolean): void {
  if (!light.castShadow) return;
  light.shadow.autoUpdate = on;
}
