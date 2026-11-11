import type { TerrainGroundHook } from '@terrain';
import { MAX_DRY, STRAW } from './dryTipColor';
import { GRASS_FUR_FROM } from './grassBands';
import type { GrassDensityUniforms } from './GrassDensityUniforms';
import { COOL_TIP_GAIN, WARM_TIP_GAIN } from './grassTipColor';

const f = (v: number) => v.toFixed(3);
const vec3 = (c: readonly number[]) => `vec3(${c.map(f).join(', ')})`;

/**
 * The far grass band for the ground shader: past the last band of tufts, grassy ground (where the density map
 * grows grass) is painted with streaks of tip colour that drift with the wind, so the meadow does not end in
 * a line. `grass` is the terrain shader's grass weight; `vTerrainPos` its world position.
 */
export function grassFurHook(density: GrassDensityUniforms): TerrainGroundHook {
  return {
    uniforms: density,
    fragmentPars: /* glsl */ `
uniform sampler2D uGrassDensity;
uniform float uGrassDensitySize;
uniform float uGrassTime;
vec3 grassFur(vec3 colour, vec3 p, float grassAmount) {
  float far = smoothstep(${f(GRASS_FUR_FROM - 15)}, ${f(GRASS_FUR_FROM + 5)}, distance(p.xz, cameraPosition.xz));
  vec4 m = texture2D(uGrassDensity, p.xz / uGrassDensitySize + 0.5);
  float fur = far * grassAmount * m.r;
  if (fur <= 0.001) return colour;
  vec2 q = p.xz * 0.8 + vec2(0.943, 0.330) * uGrassTime * 0.7;
  float streak = 0.5 + 0.5 * sin(q.x * 2.9 + sin(q.y * 1.6) * 2.2) * sin(q.y * 2.3 - q.x * 0.7);
  vec3 tip = colour * mix(${vec3(COOL_TIP_GAIN)}, ${vec3(WARM_TIP_GAIN)}, streak);
  tip = mix(tip, ${vec3(STRAW)}, m.b * ${f(MAX_DRY)}) * (1.0 - 0.3 * m.a);
  return mix(colour, tip, fur * 0.55);
}
`,
    fragmentMain: 'diffuseColor.rgb = grassFur(diffuseColor.rgb, vTerrainPos, grass);',
  };
}
