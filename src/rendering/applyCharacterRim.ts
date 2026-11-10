import * as THREE from 'three';
import { CHARACTER_RIM_FRAGMENT } from './characterRimChunk';

const ANCHOR = '#include <opaque_fragment>';
const done = new WeakSet<THREE.Material>();

/**
 * Gives every standard material under `root` a thin rim light from the key light's side, so characters
 * stand out from dark backgrounds at dusk and night. Only these materials pay for it: they get their own
 * shader program. Safe to call again on the same materials; any earlier shader patch still runs first.
 */
export function applyCharacterRim(root: THREE.Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const materials: THREE.Material[] = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) patch(material);
  });
}

function patch(material: THREE.Material): void {
  if (done.has(material) || !(material instanceof THREE.MeshStandardMaterial)) return;
  done.add(material);
  const inner = material.onBeforeCompile;
  const innerKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    inner.call(material, shader, renderer);
    shader.fragmentShader = shader.fragmentShader.replace(ANCHOR, `${CHARACTER_RIM_FRAGMENT}\n${ANCHOR}`);
  };
  material.customProgramCacheKey = () => `${innerKey}|aquobble-character-rim`;
  material.needsUpdate = true;
}
