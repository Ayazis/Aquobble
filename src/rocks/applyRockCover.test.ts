import * as THREE from 'three';
import { createGroundShadeUniforms } from '@terrain';
import { applyRockCover } from './applyRockCover';

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];

describe('applyRockCover', () => {
  it('adds moss, lichen and the wet band on top of an earlier patch', () => {
    const material = new THREE.MeshStandardMaterial();
    material.onBeforeCompile = (shader) => {
      shader.uniforms.earlier = { value: 1 };
    };
    material.customProgramCacheKey = () => 'earlier';
    const shade = createGroundShadeUniforms();
    applyRockCover(material, { wetLevel: 0.5, shade });
    const shader = {
      uniforms: {},
      vertexShader: THREE.ShaderLib.standard.vertexShader,
      fragmentShader: THREE.ShaderLib.standard.fragmentShader,
    } as Shader;
    material.onBeforeCompile(shader, undefined as unknown as THREE.WebGLRenderer);
    expect(shader.uniforms.earlier.value).toBe(1);
    expect(shader.uniforms.uRockWetLevel.value).toBe(0.5);
    expect(shader.uniforms.uGroundShadeMap).toBe(shade.uGroundShadeMap);
    expect(shader.vertexShader).toContain('vRockMoss = groundShade(');
    expect(shader.fragmentShader).toContain('float lichen =');
    expect(material.customProgramCacheKey()).toBe('earlier-rock-cover');
  });
});
