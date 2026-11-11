import * as THREE from 'three';
import { CloudShadow } from './CloudShadow';
import { cloudShadowChunk } from './cloudShadowChunk';
import { installShadowEdgeFade } from './installShadowEdgeFade';

const SMOOTH = 'vec3 irradiance = dotNL * directLight.color;';

/** Two soft-edged bands instead of a smooth falloff: lit, half-lit, and shade filled by the sky light. */
const BANDED = /* glsl */ `
	float toonNL = 0.45 * smoothstep( 0.0, 0.08, dotNL ) + 0.55 * smoothstep( 0.42, 0.52, dotNL );
	vec3 irradiance = toonNL * directLight.color * cloudShadowFactor( directLight.direction, geometryPosition );`;

/**
 * Cel shading for the whole game: rewrites the sun/moon term shared by every standard material, so terrain,
 * models, grass and trees all get the same banded light (and cloud shadows) with no per-material work. Call
 * once, before the first frame compiles any shader. Returns the cloud-shadow values the sky drives.
 */
export function installToonLighting(): CloudShadow {
  const cloudShadow = new CloudShadow();
  const chunk = THREE.ShaderChunk.lights_physical_pars_fragment;
  if (chunk.includes(SMOOTH)) {
    THREE.ShaderChunk.lights_physical_pars_fragment = cloudShadowChunk() + chunk.replace(SMOOTH, BANDED);
  }
  // three.js clones these uniform maps per material but keeps plain typed arrays by reference, so every
  // standard and physical material reads the same two arrays. Materials without them read zero: no shadow.
  for (const lib of [THREE.ShaderLib.standard, THREE.ShaderLib.physical]) {
    lib.uniforms.cloudShadowParams = { value: cloudShadow.params };
    lib.uniforms.cloudShadowSun = { value: cloudShadow.sun };
  }
  installShadowEdgeFade();
  return cloudShadow;
}
