import type { TerrainGroundHook } from '@terrain';
import type { Tide } from './Tide';

/**
 * Ground shader hook: sand the tide has just left is darker and a little cooler, from the current waterline
 * up to the tide's `wetLine`, which dries back down as the tide falls. Ragged edge from a cheap sine noise.
 * The bed under the water is left matt and a little lighter, for the water's own surface to shade.
 */
export function wetSandHook(tide: Tide): TerrainGroundHook {
  return {
    uniforms: { uTideWaterLine: tide.waterLine, uTideWetLine: tide.wetLine },
    fragmentPars: /* glsl */ `
uniform float uTideWaterLine;
uniform float uTideWetLine;
`,
    fragmentMain: /* glsl */ `
  {
    vec2 q = vTerrainPos.xz;
    float ragged = (sin(q.x * 1.7 + sin(q.y * 1.3) * 2.0) * sin(q.y * 1.9 - q.x * 0.6)) * 0.05;
    float h = vTerrainPos.y + ragged;
    // Always a damp strip just above the water, plus whatever the falling tide has not dried yet.
    float top = max(uTideWetLine, uTideWaterLine + 0.25);
    float wet = 1.0 - smoothstep(top - 0.04, top + 0.08, h);
    // Under the water the bed is no wet beach: nothing mirrors in it down there (the water above does the
    // shining), and it is lighter than sand the air has just got at.
    float sunk = smoothstep(0.02, 0.35, uTideWaterLine - vTerrainPos.y);
    diffuseColor.rgb *= mix(vec3(1.0), vec3(0.58, 0.6, 0.66), wet * (1.0 - sunk)) * mix(1.0, 1.3, sunk * terrainLayers.w);
    terrainLayers.w *= 1.0 - sunk;
  }
`,
  };
}
