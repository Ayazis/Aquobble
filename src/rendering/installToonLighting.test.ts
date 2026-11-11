import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { installToonLighting } from './installToonLighting';

describe('installToonLighting', () => {
  const cloudShadow = installToonLighting();

  it('patches the sun term with cloud shadows and the directional shadow with an edge fade', () => {
    expect(THREE.ShaderChunk.lights_physical_pars_fragment).toContain('cloudShadowFactor( directLight.direction');
    expect(THREE.ShaderChunk.lights_physical_pars_fragment).toContain('float cloudShape(');
    expect(THREE.ShaderChunk.lights_fragment_begin).toContain('shadowFade');
  });

  it('shares one set of cloud values with every cloned standard material uniform map', () => {
    const uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.standard.uniforms);
    cloudShadow.set(12, { x: 0, y: 1, z: 0 }, 0.4);
    expect(uniforms.cloudShadowParams.value).toBe(cloudShadow.params);
    expect((uniforms.cloudShadowParams.value as Float32Array)[1]).toBeCloseTo(0.4);
  });
});
