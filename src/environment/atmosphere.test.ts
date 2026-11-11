import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { HeightFog } from './HeightFog';
import { installHeightFog } from './heightFogChunk';
import { lightShaftStrength } from './lightShaftStrength';

describe('lightShaftStrength', () => {
  it('is off below the horizon, strongest low and faint at noon', () => {
    expect(lightShaftStrength(-0.1)).toBe(0);
    expect(lightShaftStrength(0.1)).toBeGreaterThan(0.9);
    expect(lightShaftStrength(1)).toBeCloseTo(0.25);
  });
});

describe('HeightFog', () => {
  it('thickens the fog with mist and clamps it', () => {
    const fog = new HeightFog();
    expect(fog.densityFor(0.002)).toBe(0.002);
    fog.mist = 3;
    expect(fog.densityFor(0.002)).toBeCloseTo(0.01);
  });
});

describe('installHeightFog', () => {
  it('patches the fog chunks once', () => {
    installHeightFog();
    const once = THREE.ShaderChunk.fog_vertex;
    installHeightFog();
    expect(THREE.ShaderChunk.fog_vertex).toBe(once);
    expect(THREE.ShaderChunk.fog_fragment).toContain('vFogHeight');
  });
});
