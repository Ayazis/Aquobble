import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createGroundShadeUniforms } from '@terrain';
import { applyGroundBlend } from './applyGroundBlend';
import { applyWindSway } from './applyWindSway';
import { createWindSway } from './WindSway';

describe('applyGroundBlend', () => {
  it('keeps the wind patch and adds the root-to-tip colour blend', () => {
    const material = new THREE.MeshStandardMaterial({ vertexColors: true });
    applyWindSway(material, createWindSway(), { strength: 0.5, fadeStart: 55, fadeEnd: 75 });
    const shade = createGroundShadeUniforms();
    applyGroundBlend(material, { tipFadeStart: 35, tipFadeEnd: 55, shade });
    const shader = {
      uniforms: {} as Record<string, THREE.IUniform>,
      vertexShader: THREE.ShaderLib.standard.vertexShader,
      fragmentShader: THREE.ShaderLib.standard.fragmentShader,
    };
    material.onBeforeCompile(shader as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer);
    expect(shader.uniforms.uWindTime).toBeDefined();
    expect(shader.vertexShader).toContain('vec3 lushGroundColor(float height)');
    expect(shader.vertexShader).toContain('smoothstep(35.0, 55.0, distance(grassRoot, cameraPosition))');
    expect(shader.vertexShader).toContain('float plantFade');
    expect(shader.vertexShader).toContain('shadedGround(lushGroundColor(grassRoot.y), grassRoot.xz)');
    expect(shader.uniforms.uGroundShadeMap).toBe(shade.uGroundShadeMap);
    expect(shader.fragmentShader).toContain('normal *= faceDirection;\n#endif');
  });
});
