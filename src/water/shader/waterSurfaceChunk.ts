import { SURF } from '../surf';

/**
 * The shape of the surface under a pixel, in world space: the analytic swell (the same Gerstner sum that
 * moved the mesh, but every wave of it and with no far fade), the surf's leaning face, four sizes of wind
 * ripple from the detail map, and the ripple simulation round the player. The ripples come in patches: a
 * slow gust map leaves slicks of smooth water between ruffled stretches (cat's paws), and the whole sea
 * roughens with the wind. Far water is rougher: its ripples are smaller than a pixel, and it is their
 * spread that widens the sun's glitter path towards the horizon.
 */
export const WATER_FRAGMENT_SURFACE = /* glsl */ `
vec2 wP = vWaterPos.xz;
float wT = uWaterTime;
float wAway = distance(vWaterPos, cameraPosition);
float wSea = 1.0 - uWaterCalm;
float wLevel = vWaterPos.y - vWaveLift;
// The bed stops at the edge of the terrain's map: the water deepens to open sea just before it.
float wOpen = 40.0 * smoothstep(0.84, 0.98, max(abs(wP.x), abs(wP.y)) / uHeightMapFrame.z);
float wGround = groundHeightAt(wP) - wOpen;
float wDepth = vWaterPos.y - wGround;
float wStill = wLevel - wGround;
mat2 wWind = mat2(uWaterWind.x, -uWaterWind.y, uWaterWind.y, uWaterWind.x);
float wGust = texture2D(uWaterNormals, (wWind * wP + wT * vec2(2.1, 0.5)) * 0.0057).b;
float wRuffle = mix(0.45, 1.2, smoothstep(0.4, 0.6, wGust)) * mix(0.7, 1.3, uWaterWind.z) * mix(1.0, 0.45, uWaterCalm);
vec3 wA = waterDetail(wP, wWind, 1.0 / 43.0, vec2(0.55, 0.06));
vec3 wB = waterDetail(wP, mat2(0.8, -0.6, 0.6, 0.8) * wWind, 1.0 / 17.0, vec2(0.34, -0.14));
vec3 wC = waterDetail(wP, mat2(0.45, 0.89, -0.89, 0.45) * wWind, 1.0 / 6.1, vec2(0.21, 0.12));
vec2 wTilt = wA.xy * 0.35 * mix(1.0, 0.5, uWaterCalm) + (wB.xy * 0.42 + wC.xy * 0.45) * wRuffle;
#ifdef WATER_FINE
vec3 wD = waterDetail(wP, mat2(-0.47, 0.88, -0.88, -0.47) * wWind, 1.0 / 1.7, vec2(0.12, -0.07));
wTilt += wD.xy * 0.4 * wRuffle * (1.0 - smoothstep(10.0, 45.0, wAway));
#endif
// The swell, per pixel (wPixel: metres of water one pixel covers).
float wPixel = max(length(dFdx(wP)), length(dFdy(wP)));
float wFold = 1.0;
vec2 wSlope = vec2(0.0);
vec2 wShoal = waveShoalAt(wLevel - groundHeightAt(vWaveRest)) * vec2(1.0, uWaterSwell);
if (wShoal.y > 0.0) {
  vec3 wSwell = gerstnerSurface(vWaveRest, wT, wShoal, wPixel, wFold);
  wSlope = wSwell.xz / wSwell.y;
}
// The surf: its height depends on the depth alone, so its slope follows the slope of the bed.
if (uWaterSwell > 0.0 && wStill < ${SURF.deep.toFixed(2)} && wStill > 0.0) {
  vec2 wBedSlope = vec2(groundHeightAt(wP + vec2(1.25, 0.0)), groundHeightAt(wP + vec2(0.0, 1.25))) - wGround;
  float wRise = (surfHeight(wStill + 0.02, wP, wT) - surfHeight(wStill - 0.02, wP, wT)) / 0.04;
  wSlope += wRise * uWaterSwell * wBedSlope / 1.25;
}
vec3 wRipple = rippleAt(wP);
vec2 wLean = wSlope + wTilt + wRipple.xy;
normal = normalize((viewMatrix * vec4(normalize(vec3(wLean.x, 1.0, wLean.y)), 0.0)).xyz);
roughnessFactor = mix(0.07, 0.3, smoothstep(20.0, 450.0, wAway));
// The opaque scene straight behind this pixel, and how far below the surface it lies (m).
vec2 wScreen = gl_FragCoord.xy / uSceneResolution;
float wHere = vViewPosition.z;
vec4 wStraight = vec4(0.0, 0.0, 0.0, wHere + 1000.0);
if (uRefraction > 0.5) wStraight = texture2D(uSceneColour, wScreen);
// (An empty copy, as on the first frames, reads as nothing behind for a long way.)
float wGap = wStraight.a > wHere * 0.998 - 0.02 ? max(wStraight.a - wHere, 0.0) : 1000.0;
float wSunk = wGap * abs(normalize(cameraPosition - vWaterPos).y);
`;
