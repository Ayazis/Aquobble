import type { GrassBand } from './GrassBand';
import { GRASS_WIND_GLSL } from './grassWindGlsl';

/** Blade length scale: typical blades come out shin to knee high on a 1.6 m character, fescue to the hip. */
export const GRASS_HEIGHT = 1.0;

const f = (v: number) => v.toFixed(4);

/**
 * Vertex code that bends the blade (after `grassPlaceGlsl`). A blade is a quadratic curve from its root to a
 * tip that sits a fixed blade length away, so wind and feet swing it over instead of stretching it
 * (`GRASS_WIND_GLSL` says where the tip goes); the middle of the blade follows the flutter a beat late, so it
 * whips. Blades turn a little towards the camera when seen edge on, so they never thin to nothing. Sets
 * `transformed` (world space), `gNormal` and `gT`.
 */
export function grassShapeGlsl(band: GrassBand): string {
  return /* glsl */ `
// Tussocks are domed: blades at the centre stand taller than those at the rim.
float gDome = 1.1 - 0.28 * min(sqrt(gClumpDist) * 1.4, 1.0);
float gLen = (0.3 + 0.3 * gDraw.x + 0.18 * gClump.z) * (1.0 + 0.5 * gTall - 0.28 * gBroad)
  * gDome * gMap.g * gSize * ${f(GRASS_HEIGHT)};
float gHalf = ${f(band.halfWidth)} * (0.7 + 0.6 * gDraw.y) * (1.0 + 0.9 * gBroad - 0.3 * gTall) * (0.5 + 0.5 * gSize);
// Never thinner than about a pixel, or far blades shimmer.
gHalf = max(gHalf, gDist * 0.0009);
float gYaw = gDraw.z * 6.2832;
vec2 gFace = normalize(mix(vec2(cos(gYaw), sin(gYaw)), gAway, 0.6 * gClump.w) + 1e-4);
float gLean = 0.14 + 0.42 * gDraw.w * gDraw.w + 0.22 * gTall;

${GRASS_WIND_GLSL}
float gReach = length(gOff);
gOff *= min(1.0, 0.97 / max(gReach, 1e-4));
float gTipY = sqrt(1.0 - min(gReach, 0.97) * min(gReach, 0.97));
vec3 gTip = vec3(gOff.x, gTipY, gOff.y) * gLen;
float gArch = mix(gTipY, 1.0, 0.35 * (1.0 - gTrample)) * 0.72;
vec3 gCtrl = vec3(gOff.x * 0.22, gArch, gOff.y * 0.22) * gLen;
gCtrl.xz += uWindDirection * (sin(gPhase - 1.2) * 0.05 * gBreeze * gFlex * gLen);

float gT = position.y;
vec3 gRoot = vec3(gXZ.x, groundHeightAt(gXZ) - 0.03, gXZ.y);
vec3 gAt = gRoot + gCtrl * (2.0 * (1.0 - gT) * gT) + gTip * (gT * gT);
vec3 gTangent = normalize(gCtrl * (2.0 - 2.0 * gT) + (gTip - gCtrl) * (2.0 * gT) + vec3(0.0, 1e-4, 0.0));
vec3 gWide = vec3(-gFace.y, 0.0, gFace.x);
vec3 gNormal = normalize(cross(gWide, gTangent));
vec3 gToCam = normalize(cameraPosition - gAt);
float gFacing = dot(gNormal, gToCam);
gWide = normalize(gWide - gNormal * (sign(dot(gWide, gToCam) * gFacing) * (1.0 - abs(gFacing)) * 0.55));
gNormal = normalize(cross(gWide, gTangent));
float gTaper = (1.0 - pow(gT, 2.2)) * (0.72 + 0.28 * smoothstep(0.0, 0.3, gT));
transformed = gAt + gWide * (position.x * gHalf * gTaper);
// Rounded across its width, so a blade catches the light like a shallow gutter rather than a flat card.
gNormal = normalize(gNormal + gWide * (position.x * 0.45));
`;
}
