import * as THREE from 'three';
import { CloudShadow } from './CloudShadow';
import { cloudShadowChunk } from './cloudShadowChunk';
import { installToonLightingShadows } from './installToonLightingShadows';
import { toonLightingChunk } from './toonLightingChunk';
import { ToonLightUniforms } from './ToonLightUniforms';
import { WEATHER_WET_FRAGMENT, WEATHER_WET_PARS } from './weatherWetChunk'; // lane G

const SMOOTH = 'vec3 irradiance = dotNL * directLight.color;';

/** Two soft-edged bands instead of a smooth falloff: lit, half-lit, and shade filled by the sky light. */
const BANDED = /* glsl */ `
	float toonNL = 0.45 * smoothstep( 0.0, 0.08, dotNL ) + 0.55 * smoothstep( 0.42, 0.52, dotNL );
	vec3 irradiance = toonNL * directLight.color * cloudShadowFactor( directLight.direction, geometryPosition );`;

const LIT_LIBS = ['standard', 'physical', 'lambert', 'phong', 'toon'] as const;

/** Shared lighting values the rest of the game drives. */
export interface ToonLighting {
  cloudShadow: CloudShadow;
  light: ToonLightUniforms;
  /** Lane G: weather. x = how wet up-facing surfaces are (0..1), y = puddle growth (0..1). */
  wetness: Float32Array;
}

/**
 * Cel shading for the whole game: rewrites the sun/moon term shared by every standard material, so terrain,
 * models, grass and trees all get the same banded light (and cloud shadows) with no per-material work. Also
 * installs cascaded, palette-tinted shadows and the street light probes. Call once, before the first frame
 * compiles any shader. `cloudShadows` false keeps the cloud shadows off (a phone switch).
 */
export function installToonLighting(cloudShadows = true): ToonLighting {
  const cloudShadow = new CloudShadow();
  cloudShadow.enabled = cloudShadows;
  const light = new ToonLightUniforms();
  const chunk = THREE.ShaderChunk.lights_physical_pars_fragment;
  if (chunk.includes(SMOOTH)) {
    THREE.ShaderChunk.lights_physical_pars_fragment =
      WEATHER_WET_PARS + cloudShadowChunk() + chunk.replace(SMOOTH, BANDED); // lane G: weather
    THREE.ShaderChunk.normal_fragment_maps += WEATHER_WET_FRAGMENT; // lane G: weather
  }
  const wetness = new Float32Array(4); // lane G: weather
  if (installToonLightingShadows()) {
    THREE.ShaderChunk.lights_pars_begin = toonLightingChunk() + THREE.ShaderChunk.lights_pars_begin;
  }
  // three.js clones these uniform maps per material but keeps plain typed arrays by reference, so every
  // lit material reads the same arrays. Materials without them read zero: no cloud shadow, black shadow tint.
  for (const lib of [THREE.ShaderLib.standard, THREE.ShaderLib.physical]) {
    lib.uniforms.cloudShadowParams = { value: cloudShadow.params };
    lib.uniforms.cloudShadowSun = { value: cloudShadow.sun };
    lib.uniforms.uWetness = { value: wetness }; // lane G: weather
  }
  for (const name of LIT_LIBS) {
    const lib = THREE.ShaderLib[name];
    lib.uniforms.toonShadowTint = { value: light.shadowTint };
    lib.uniforms.toonProbePos = { value: light.probePositions };
    lib.uniforms.toonProbeSh = { value: light.probeSh };
  }
  return { cloudShadow, light, wetness };
}
