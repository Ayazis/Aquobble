import type { GrassBand } from './GrassBand';

/** Side (m) of the cells tussocks grow in: every blade joins the nearest tussock. */
export const CLUMP_SIZE = 0.8;

const f = (v: number) => v.toFixed(4);

/**
 * Vertex code that decides where the blade of this instance grows and whether it is there at all. Instances
 * count through the tiles of `aTile` (one origin per tile, see `GrassTileSystem`), `side * side` blades each,
 * jittered on a grid of world cells so no two tiles repeat. Blades gather in tussocks, the density map and the
 * band's distance fade thin them (each blade leaves at its own share of the fade, so the field thins instead
 * of shrinking), and slow noise mixed with the tussock's own draw picks its kind: broad lush blades, meadow
 * grass, or tall pale fescue. Sets `gXZ`, `gMap`, `gDist`, `gSize` (0 = no blade) and the random draws.
 */
export function grassPlaceGlsl(band: GrassBand): string {
  const cell = band.tile / band.side;
  const grow = band.fadeIn[1] > 0 ? `gKeep *= smoothstep(${f(band.fadeIn[0])}, ${f(band.fadeIn[1])}, gDist);` : '';
  return /* glsl */ `
int gIndex = gl_InstanceID % ${band.side * band.side};
vec2 gCell = floor(aTile / ${f(cell)} + 0.5) + vec2(float(gIndex % ${band.side}), float(gIndex / ${band.side}));
vec4 gRand = vec4(grassHash2(gCell), grassHash2(gCell + 47.3));
vec4 gDraw = vec4(grassHash2(gCell + 113.9), grassHash2(gCell + 201.1));
vec2 gXZ = (gCell + gRand.xy) * ${f(cell)};

// The nearest of the four tussock centres round the blade.
vec2 gQ = gXZ / ${f(CLUMP_SIZE)};
vec2 gBase = floor(gQ - 0.5);
vec2 gClumpId = gBase;
vec2 gClumpAt = gQ;
float gClumpDist = 1e9;
for (int k = 0; k < 4; k++) {
  vec2 id = gBase + vec2(float(k & 1), float(k >> 1));
  vec2 at = id + 0.2 + 0.6 * grassHash2(id + 71.3);
  float d = dot(gQ - at, gQ - at);
  if (d < gClumpDist) {
    gClumpDist = d;
    gClumpId = id;
    gClumpAt = at;
  }
}
vec4 gClump = vec4(grassHash2(gClumpId + 3.1), grassHash2(gClumpId + 91.7));
vec2 gCentre = gClumpAt * ${f(CLUMP_SIZE)};
gXZ = mix(gXZ, gCentre, 0.3 * gClump.x);
vec2 gAway = (gXZ - gCentre) / max(distance(gXZ, gCentre), 1e-3);

vec4 gMap = texture2D(uGrassDensity, gXZ / uGrassDensitySize + 0.5);
float gDist = distance(gXZ, cameraPosition.xz);
float gKeep = 1.0 - smoothstep(${f(band.fadeOut[0])}, ${f(band.fadeOut[1])}, gDist);
${grow}
float gSize = smoothstep(gRand.z * 0.75, gRand.z * 0.75 + 0.25, gKeep);
gSize *= step(gRand.w, gMap.r * uGrassKeep) * step(0.02, gMap.g);

float gKind = gClump.y * 0.55 + grassNoise(gXZ * 0.05 + 7.3) * 0.75 - 0.15;
float gBroad = 1.0 - smoothstep(0.26, 0.36, gKind);
float gTall = smoothstep(0.62, 0.74, gKind);
`;
}
