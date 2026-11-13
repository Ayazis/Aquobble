/**
 * White water. Everything that makes foam adds to one cover value, and the foam map turns cover into
 * bubbles: a little cover is torn lace, more closes into a solid sheet. Sources: the waterline, where each
 * wave's swash leaves a sheet that drains away; the white water behind a breaking surf crest; whitecaps
 * where the swell folds over (more of them in a stiff wind); footsteps, wakes and splashes from the ripple
 * map; and a collar round anything that stands in the water (desktop: it needs the scene's depth).
 * Writes `waterFoam` (0..1).
 */
export const WATER_FRAGMENT_FOAM = /* glsl */ `
vec2 wBubbles = texture2D(uWaterFoamMap, wP * 0.23 + wTilt * 0.06 + wT * vec2(0.016, -0.011)).rg;
float wLace = wBubbles.r * 0.62
  + texture2D(uWaterFoamMap, wP.yx * 0.071 + wTilt * 0.03 - wT * vec2(0.007, 0.009)).r * 0.38;
float wSwash = surfSwash(wP, wT) * wSea;
// The waterline: a ragged band that swells as a wave runs up and tears apart as it drains, and the
// thinning sheet behind it.
float wEdge = 0.03 + 0.22 * wSwash;
float wCover = (0.55 + 0.3 * wSwash) * (1.0 - smoothstep(wEdge * 0.35, wEdge, wDepth));
wCover = max(wCover, (0.3 + 0.45 * wSwash) * wSea * (1.0 - smoothstep(0.0, 0.25 + 0.5 * wSwash, wDepth)));
wCover *= mix(1.0, 0.3, uWaterCalm);
float wSeaState = min(uWaterSwell, 1.0);
wCover = max(wCover, surfBore(wStill, wP, wT) * wSeaState);
// Whitecaps: where the swell's crests are squeezed hardest, sooner in a stronger wind.
float wCapAt = mix(0.6, 0.76, uWaterWind.z);
wCover = max(wCover, 0.85 * wSeaState * smoothstep(wCapAt, wCapAt - 0.15, wFold) * smoothstep(0.6, 1.6, wStill));
wCover = max(wCover, wRipple.z * 1.1);
// A collar of foam where something other than the bed breaks the surface.
float wCollar = (1.0 - smoothstep(0.02, 0.2, wSunk)) * smoothstep(0.12, 0.45, wDepth - wSunk);
wCover = max(wCover, wCollar * (0.6 + 0.3 * sin(wT * 1.9 + wP.x * 2.3 + wP.y * 1.7)));
waterFoam = clamp((wLace + wCover * 1.3 - 1.0) / 0.25, 0.0, 1.0);
`;
