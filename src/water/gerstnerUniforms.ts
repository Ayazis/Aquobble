import * as THREE from 'three';
import type { GerstnerTerm } from './GerstnerWaveField';

/** The uniforms read by `gerstnerGlsl`, filled from the same terms the CPU wave field uses. */
export interface GerstnerUniforms {
  [name: string]: THREE.IUniform;
  uWaveA: THREE.IUniform<THREE.Vector4[]>;
  uWaveB: THREE.IUniform<THREE.Vector4[]>;
}

export function gerstnerUniforms(terms: readonly GerstnerTerm[]): GerstnerUniforms {
  // A flat dummy wave keeps the arrays non-empty for a field without waves.
  const list = terms.length > 0 ? terms : [{ dirX: 1, dirZ: 0, k: 1, amplitude: 0, omega: 0, phase: 0, pull: 0 }];
  return {
    uWaveA: { value: list.map((w) => new THREE.Vector4(w.dirX, w.dirZ, w.k, w.amplitude)) },
    uWaveB: { value: list.map((w) => new THREE.Vector4(w.omega, w.phase, w.pull, 0)) },
  };
}
