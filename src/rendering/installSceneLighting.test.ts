import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { installSceneLighting } from './installSceneLighting';

describe('installSceneLighting', () => {
  const { cloudShadow, light } = installSceneLighting();

  it('patches the sun term with cloud shadows and the directional shadow with an edge fade', () => {
    expect(THREE.ShaderChunk.lights_physical_pars_fragment).toContain('cloudShadowFactor( directLight.direction');
    expect(THREE.ShaderChunk.lights_physical_pars_fragment).toContain('float cloudShape(');
    expect(THREE.ShaderChunk.lights_fragment_begin).toContain('sceneShadowFade');
    expect(THREE.ShaderChunk.lights_fragment_begin).toContain('directionalShadowMap[ 1 ]');
    expect(THREE.ShaderChunk.lights_fragment_begin).toContain('sceneProbeFactor(');
    expect(THREE.ShaderChunk.lights_pars_begin).toContain('uniform vec3 sceneShadowTint;');
  });

  it('shares the shadow tint and probes with lambert materials too', () => {
    const uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.lambert.uniforms);
    light.setProbes([{ position: { x: 1, y: 2, z: 3 }, radius: 9, sh: [0.5, 0, 0.3, 0] }]);
    expect(uniforms.sceneShadowTint.value).toBe(light.shadowTint);
    expect((uniforms.sceneProbePos.value as Float32Array)[3]).toBe(9);
  });

  it('shares one set of cloud values with every cloned standard material uniform map', () => {
    const uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.standard.uniforms);
    cloudShadow.set(12, { x: 0, y: 1, z: 0 }, 0.4);
    expect(uniforms.cloudShadowParams.value).toBe(cloudShadow.params);
    expect((uniforms.cloudShadowParams.value as Float32Array)[1]).toBeCloseTo(0.4);
  });
});
