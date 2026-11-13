/**
 * Vertex code that works out `gOff`, where the blade's tip sits sideways of its root as a share of its length
 * (needs `gFace`, `gLean` and the draws of `grassPlaceGlsl`). The blade's own lean is pushed by the wind: a
 * steady push, the shared gust fronts, waves of noise rolling downwind, and a flutter of its own; fescue gives
 * most, broad blades least. The trampling bend map then lays it over along the push, and it shivers while it
 * springs back. Also sets `gGust`, `gWave`, `gBreeze`, `gFlex`, `gPhase`, `gBend` and `gTrample`.
 */
export const GRASS_WIND_GLSL = /* glsl */ `
float gGust = windGust(gXZ);
vec2 gWaveAt = gXZ * 0.11 - uWindDirection * uWindTime * (0.8 + 1.8 * uWindStrength);
float gWave = grassNoise(gWaveAt) * 0.65 + grassNoise(gWaveAt * 2.9 + 19.0) * 0.35;
float gBreeze = 0.25 + uWindStrength;
float gFlex = 1.0 + 0.5 * gTall - 0.3 * gBroad;
float gPhase = uWindTime * (2.6 + 2.2 * gDraw.x) + gRand.x * 6.2832;
float gPush = 0.05 + 0.3 * uWindStrength + 0.85 * gGust + (gWave - 0.4) * 0.6 * gBreeze;
vec2 gAcross = vec2(-uWindDirection.y, uWindDirection.x);
vec2 gWind = uWindDirection * (gPush + sin(gPhase) * 0.07 * gBreeze)
  + gAcross * sin(uWindTime * 1.9 + gRand.y * 6.2832) * 0.07 * gBreeze;
vec2 gOff = gFace * gLean + gWind * gFlex;

// Trampling lays the blade over along the push; while it springs back it shivers.
vec4 gBend = bendAt(gXZ);
float gTrample = clamp(length(gBend.xy), 0.0, 1.0);
gOff = mix(gOff, gBend.xy * 1.25 + gFace * 0.1, gTrample);
gOff += gBend.zw * 0.04 * sin(uWindTime * 17.0 + gRand.x * 40.0);
`;
