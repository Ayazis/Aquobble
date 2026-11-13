import * as THREE from 'three';
import { CloudShadow } from './CloudShadow';
import { cloudShadowChunk } from './cloudShadowChunk';
import { installSceneLightingShadows } from './installSceneLightingShadows';
import { sceneLightingChunk } from './sceneLightingChunk';
import { SceneLightUniforms } from './SceneLightUniforms';
import { WEATHER_WET_FRAGMENT, WEATHER_WET_PARS } from './weatherWetChunk'; // lane G

const SMOOTH = 'vec3 irradiance = dotNL * directLight.color;';

/** The physical falloff, with the sun dimmed where a cloud stands between it and the surface. */
const CLOUDED = /* glsl */ `
	vec3 irradiance = dotNL * directLight.color * cloudShadowFactor( directLight.direction, geometryPosition );`;

const LIT_LIBS = ['standard', 'physical', 'lambert', 'phong', 'toon'] as const;

/** Shared lighting values the rest of the game drives. */
export interface SceneLighting {
  cloudShadow: CloudShadow;
  light: SceneLightUniforms;
  /** Lane G: weather. x = how wet up-facing surfaces are (0..1), y = puddle growth (0..1). */
  wetness: Float32Array;
}

/**
 * Lighting shared by the whole game: patches the sun/moon term of every standard material, so terrain,
 * models, grass and trees are all dimmed by the same drifting cloud shadows with no per-material work. Also
 * installs the cascaded sun shadows and the street light probes that shut the sky out of narrow streets.
 * Call once, before the first frame compiles any shader. `cloudShadows` false keeps the cloud shadows off
 * (a phone switch).
 */
export function installSceneLighting(cloudShadows = true): SceneLighting {
  const cloudShadow = new CloudShadow();
  cloudShadow.enabled = cloudShadows;
  const light = new SceneLightUniforms();
  const chunk = THREE.ShaderChunk.lights_physical_pars_fragment;
  if (chunk.includes(SMOOTH)) {
    THREE.ShaderChunk.lights_physical_pars_fragment =
      WEATHER_WET_PARS + cloudShadowChunk() + chunk.replace(SMOOTH, CLOUDED); // lane G: weather
    THREE.ShaderChunk.normal_fragment_maps += WEATHER_WET_FRAGMENT; // lane G: weather
  }
  const wetness = new Float32Array(4); // lane G: weather
  if (installSceneLightingShadows()) {
    THREE.ShaderChunk.lights_pars_begin = sceneLightingChunk() + THREE.ShaderChunk.lights_pars_begin;
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
    lib.uniforms.sceneShadowTint = { value: light.shadowTint };
    lib.uniforms.sceneProbePos = { value: light.probePositions };
    lib.uniforms.sceneProbeSh = { value: light.probeSh };
  }
  return { cloudShadow, light, wetness };
}
