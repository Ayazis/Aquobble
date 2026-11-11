import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createGroundShadeUniforms } from './GroundShadeUniforms';
import { TerrainMaterialFactory } from './TerrainMaterialFactory';
import { createTerrainTextureUniforms } from './TerrainTextureUniforms';

describe('TerrainMaterialFactory', () => {
  it('patches the standard shader and shares the texture uniforms', () => {
    const uniforms = createTerrainTextureUniforms();
    const material = new TerrainMaterialFactory().create({ ...uniforms, ...createGroundShadeUniforms() });
    const shader = {
      uniforms: {} as Record<string, THREE.IUniform>,
      vertexShader: THREE.ShaderLib.standard.vertexShader,
      fragmentShader: THREE.ShaderLib.standard.fragmentShader,
    };
    material.onBeforeCompile(shader as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer);
    expect(shader.vertexShader).toContain('vTerrainPos = ');
    expect(shader.fragmentShader).toContain('uniform sampler2D uRockMap;');
    expect(shader.fragmentShader).toContain('diffuseColor.rgb *= mix(');
    expect(shader.fragmentShader).toContain('shadedGround(lushGroundColor(hn)');
    expect(shader.uniforms.uGroundShadeMap.value).toBeInstanceOf(THREE.DataTexture);
    expect(shader.uniforms.uTerrainDetail).toBe(uniforms.uTerrainDetail);
    expect(uniforms.uTerrainDetail.value).toBe(0);
  });
});
