import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { SurfaceDetailLibrary } from './SurfaceDetailLibrary';

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];

const FRAGMENT = 'void main() {\n#include <common>\n#include <color_fragment>\n#include <normal_fragment_maps>\n}';
const VERTEX = '#include <common>\nvoid main() {\n#include <begin_vertex>\n}';

function compile(material: THREE.Material): Shader {
  const shader = { uniforms: {}, vertexShader: VERTEX, fragmentShader: FRAGMENT } as Shader;
  material.onBeforeCompile(shader, undefined as unknown as THREE.WebGLRenderer);
  return shader;
}

const library = () =>
  new SurfaceDetailLibrary({
    stone: { path: 'stone.webp', scale: 1, strength: 1 },
    cobble: { path: 'cobble.webp', scale: 1, strength: 1, normalPath: 'cobble-normal.webp' },
  });

describe('SurfaceDetailLibrary', () => {
  it('tilts the normal only for kinds that have a normal map', () => {
    const cobble = new THREE.MeshStandardMaterial();
    const stone = new THREE.MeshStandardMaterial();
    const surfaces = library();
    surfaces.apply(cobble, 'cobble');
    surfaces.apply(stone, 'stone');

    const carved = compile(cobble).fragmentShader;
    expect(carved).toContain('texture2D(uDetailNormalMap');
    expect(carved.indexOf('uDetailNormalMap,')).toBeGreaterThan(carved.indexOf('#include <normal_fragment_maps>'));
    expect(compile(stone).fragmentShader).not.toContain('texture2D(uDetailNormalMap');
    expect(cobble.customProgramCacheKey()).not.toBe(stone.customProgramCacheKey());
  });

  it('keeps the colour detail and shares uniforms between materials of one kind', () => {
    const surfaces = library();
    const a = new THREE.MeshStandardMaterial();
    const b = new THREE.MeshStandardMaterial();
    surfaces.apply(a, 'cobble');
    surfaces.apply(b, 'cobble');
    const shaderA = compile(a);
    expect(shaderA.fragmentShader).toContain('surfaceDetail(p.xz)');
    expect(shaderA.uniforms.uDetailNormalMap).toBe(compile(b).uniforms.uDetailNormalMap);
  });

  it('leaves materials of unknown kinds alone', () => {
    const material = new THREE.MeshStandardMaterial();
    const before = material.onBeforeCompile;
    library().apply(material, 'wood');
    expect(material.onBeforeCompile).toBe(before);
  });
});
