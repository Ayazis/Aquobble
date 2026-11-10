import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { applyCharacterRim } from './applyCharacterRim';

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];

function compile(material: THREE.Material): string {
  const shader = { fragmentShader: 'void main() {\n#include <opaque_fragment>\n}' } as Shader;
  material.onBeforeCompile(shader, undefined as unknown as THREE.WebGLRenderer);
  return shader.fragmentShader;
}

describe('applyCharacterRim', () => {
  it('adds the rim before the output and gives the material its own program key', () => {
    const material = new THREE.MeshStandardMaterial();
    const plain = new THREE.MeshStandardMaterial();
    applyCharacterRim(new THREE.Mesh(new THREE.BufferGeometry(), material));
    const fragment = compile(material);
    expect(fragment.indexOf('rimEdge')).toBeGreaterThan(-1);
    expect(fragment.indexOf('rimEdge')).toBeLessThan(fragment.indexOf('#include <opaque_fragment>'));
    expect(material.customProgramCacheKey()).toContain('aquobble-character-rim');
    expect(compile(plain)).not.toContain('rimEdge');
  });

  it('patches a material only once', () => {
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    applyCharacterRim(mesh);
    const patched = material.onBeforeCompile;
    applyCharacterRim(mesh);
    expect(material.onBeforeCompile).toBe(patched);
  });
});
