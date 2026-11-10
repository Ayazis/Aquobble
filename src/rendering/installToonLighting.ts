import * as THREE from 'three';

const SMOOTH = 'vec3 irradiance = dotNL * directLight.color;';

/** Two soft-edged bands instead of a smooth falloff: lit, half-lit, and shade filled by the sky light. */
const BANDED = /* glsl */ `
	float toonNL = 0.45 * smoothstep( 0.0, 0.08, dotNL ) + 0.55 * smoothstep( 0.42, 0.52, dotNL );
	vec3 irradiance = toonNL * directLight.color;`;

/**
 * Cel shading for the whole game: rewrites the sun/moon term shared by every standard material, so terrain,
 * models, grass and trees all get the same banded light with no per-material work. Call once, before the
 * first frame compiles any shader.
 */
export function installToonLighting(): void {
  const chunk = THREE.ShaderChunk.lights_physical_pars_fragment;
  if (chunk.includes(SMOOTH)) THREE.ShaderChunk.lights_physical_pars_fragment = chunk.replace(SMOOTH, BANDED);
}
