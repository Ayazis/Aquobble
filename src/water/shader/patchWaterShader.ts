import type * as THREE from 'three';
import { WATER_FRAGMENT_COLOUR } from './waterColourChunk';
import { WATER_FRAGMENT_FOAM } from './waterFoamChunk';
import { waterFragmentPars } from './waterFragmentPars';
import { WATER_FRAGMENT_GLINT_LIMIT, WATER_FRAGMENT_GLOW, WATER_FRAGMENT_SPECULAR } from './waterGlowChunk';
import { WATER_FRAGMENT_REFLECTION } from './waterReflectionChunk';
import { WATER_FRAGMENT_REFRACTION } from './waterRefractionChunk';
import { WATER_FRAGMENT_SURFACE } from './waterSurfaceChunk';
import { WATER_VERTEX_MAIN, waterVertexPars } from './waterVertexChunk';

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];

/** The water's fragment work, in order: each chunk reads what the ones before it worked out. */
const FRAGMENT_MAIN = [
  WATER_FRAGMENT_SURFACE,
  WATER_FRAGMENT_FOAM,
  WATER_FRAGMENT_COLOUR,
  WATER_FRAGMENT_REFRACTION,
  WATER_FRAGMENT_REFLECTION,
  WATER_FRAGMENT_GLOW,
].join('\n');

/**
 * Turns a compiled `MeshStandardMaterial` into water: the vertex stage rides the waves, the fragment stage
 * replaces the material's normal with the water surface and sets its colour, foam, roughness and what shows
 * through and mirrors in it, all before the material's own lighting (sun, sky, shadows, fog) runs.
 * `waveCount` waves in all, the first `meshWaveCount` of them move the mesh.
 */
export function patchWaterShader(shader: Shader, waveCount: number, meshWaveCount: number): void {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${waterVertexPars(waveCount, meshWaveCount)}`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>\n${WATER_VERTEX_MAIN}`);
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${waterFragmentPars(waveCount)}`)
    // The material's own normal mapping (and the rain-wet patch that rides on it) has no business here.
    .replace('#include <normal_fragment_maps>', '')
    .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FRAGMENT_MAIN}`)
    .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>\n${WATER_FRAGMENT_SPECULAR}`)
    .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>\n${WATER_FRAGMENT_GLINT_LIMIT}`);
}
