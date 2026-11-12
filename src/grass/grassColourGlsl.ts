import { MAX_DRY, STRAW } from './dryTipColor';
import { COOL_TIP_GAIN, WARM_TIP_GAIN } from './grassTipColor';

/** Camera distance over which tips take on the ground colour, so far grass melts into the ground fur. */
const TIP_FADE = [70, 115];

const f = (v: number) => v.toFixed(3);
const vec3 = (c: readonly number[]) => `vec3(${c.map(f).join(', ')})`;

/**
 * Vertex code that colours the blade (after `grassShapeGlsl`) and hands the fragment shader what it needs to
 * light it. Colour runs from the ground under the root to a tip that is the ground colour pushed cool or warm
 * (a tussock mostly shares one tint), deeper for broad blades, paler for fescue, straw where the density map
 * says dry, with the odd dead blade anywhere. Gusts and wind waves lighten the tips as blades lay over.
 * `vGrassLook` = along the blade, across it, occlusion (dark roots in deep grass) and roughness (glossy tips);
 * `vGrassFar` = how far the normal leans to the ground's, and how much light the blade lets through.
 */
export const GRASS_COLOUR_GLSL = /* glsl */ `
vec3 gGround = shadedGround(lushGroundColor(gRoot.y), gXZ);
vec3 gTipCol = gGround * mix(${vec3(COOL_TIP_GAIN)}, ${vec3(WARM_TIP_GAIN)}, fract(gClump.x * 1.7 + gDraw.y * 0.35));
gTipCol *= mix(vec3(1.0), vec3(0.74, 0.94, 0.8), gBroad);
gTipCol *= mix(vec3(1.0), vec3(1.16, 1.07, 0.72), gTall * 0.7);
float gDry = max(gMap.b * ${f(MAX_DRY)} + gTall * 0.18, step(0.95, gRand.x) * 0.8);
gTipCol = mix(gTipCol, ${vec3(STRAW)}, min(gDry, 0.9));
// Forest floor grass is darker than the meadow.
gTipCol *= 1.0 - 0.3 * gMap.a;
float gFade = 1.0 - smoothstep(${f(TIP_FADE[0])}, ${f(TIP_FADE[1])}, gDist);
float gTipW = pow(gT, 1.25) * gFade;
vec3 gCol = mix(gGround * 0.9, gTipCol, gTipW);
gCol *= 1.0 + (gGust + max(gWave - 0.5, 0.0) * 0.8 * gBreeze) * gTipW * vec3(0.22, 0.2, 0.1);
gCol *= 1.0 + clamp(length(gBend.zw) * 0.45, 0.0, 1.0) * gTipW * vec3(0.4, 0.38, 0.24);
vGrassColour = gCol;

float gNear = 1.0 - smoothstep(12.0, 70.0, gDist);
float gDeep = mix(0.8, 0.3, gMap.r * gMap.g);
float gShade = mix(1.0, mix(gDeep, 1.0, smoothstep(0.0, 0.7, gT)), gFade);
float gRough = mix(0.9, mix(0.88, mix(0.5, 0.4, gBroad), gT), gNear);
vGrassLook = vec4(gT, position.x, gShade, gRough);
vGrassFar = vec2(mix(0.85, 0.3, gNear), mix(0.25, 1.0, gT) * (1.0 - 0.4 * gBroad));
// The ground's own normal, so far grass is lit like the slope it grows on.
vec3 gSlope = normalize(vec3(
  groundHeightAt(gXZ - vec2(1.5, 0.0)) - groundHeightAt(gXZ + vec2(1.5, 0.0)),
  3.0,
  groundHeightAt(gXZ - vec2(0.0, 1.5)) - groundHeightAt(gXZ + vec2(0.0, 1.5))
));
vGrassUp = mat3(viewMatrix) * gSlope;
vNormal = normalize(mat3(viewMatrix) * gNormal);
transformedNormal = vNormal;
`;
