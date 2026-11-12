/**
 * Looking through the water (desktop, needs the copy of the opaque scene in `SCENE_COLOUR_UNIFORMS`).
 *
 * The scene behind is read where the tilted surface bends the view to, further off the more water lies in
 * between; red, green and blue bend a little differently, which fringes the edges of what is seen through
 * a ripple. Caustics are laid on whatever is down there, at the spot where the sun's ray to it crossed the
 * surface. Then every metre of water crossed takes its toll: red goes first, green second, so shallows are
 * clear turquoise and depths blue. The water's own lit colour is scaled by how opaque it has become and the
 * scene is added as emission, so the surface draws opaque. With `uRefraction` 0 (phones) nothing changes.
 */
export const WATER_FRAGMENT_REFRACTION = /* glsl */ `
if (uRefraction > 0.5) {
  vec2 wLens = vec2(uSceneProjection[0][0], uSceneProjection[1][1]);
  vec2 wBend = (normal.xy - viewMatrix[1].xy) * wLens * (0.24 * min(wGap, 1.6) / max(wHere, 0.5));
  vec2 wUv = wScreen + wBend;
  vec4 wBehind = texture2D(uSceneColour, wUv);
  // Never refract something that stands in front of the water.
  if (wBehind.a < wHere) {
    wBehind = wStraight;
    wUv = wScreen;
    wBend = vec2(0.0);
  }
#ifdef WATER_FINE
  vec4 wRed = texture2D(uSceneColour, wUv - wBend * 0.22);
  vec4 wBlue = texture2D(uSceneColour, wUv + wBend * 0.22);
  if (wRed.a >= wHere) wBehind.r = wRed.r;
  if (wBlue.a >= wHere) wBehind.b = wBlue.b;
#endif
  // No valid depth behind (empty or unresolved copy): draw plain lit water, never the dark copy.
  float wThick = wBehind.a > wHere + 0.01 ? wBehind.a - wHere + wOpen : 1e4;
  // Where the thing behind is in the world, and how far under the surface.
  vec2 wNdc = wUv * 2.0 - 1.0;
  vec3 wBed = cameraPosition + (vec4(vec3(wNdc / wLens, -1.0) * wBehind.a, 0.0) * viewMatrix).xyz;
  float wUnder = clamp(wLevel - wBed.y, 0.0, 30.0);
  float wSunny = clamp(dot(wSunColour, vec3(0.3333)) / 3.0, 0.0, 1.0) * smoothstep(0.0, 0.15, wSun.y);
  float wFocus = smoothstep(0.02, 0.45, wUnder) * exp(-wUnder * 0.2) * wSunny * mix(1.0, 0.5, uWaterCalm);
  vec3 wCaustic = waterCaustics(wBed.xz + wSun.xz / max(wSun.y, 0.35) * wUnder * 0.75, wT, wUnder, wPixel);
  wBehind.rgb *= mix(vec3(1.0), 0.3 + 0.7 * wCaustic, wFocus);
  // A pond is murkier than the sea, and what it takes away is not red alone: it goes green-brown.
  vec3 wToll = mix(vec3(0.42, 0.105, 0.07), vec3(0.95, 0.55, 0.8), uWaterCalm);
  vec3 wThrough = exp(-wThick * wToll) * (1.0 - waterFoam);
  totalEmissiveRadiance += wBehind.rgb * wThrough;
  // What the water itself scatters back: its deep colour, the more of it the less shows through.
  vec3 wVolume = mix(wDeepColour, vec3(0.03, 0.1, 0.05), uWaterCalm) * (0.55 * wDim * (1.0 - dot(wThrough, vec3(0.3333))));
  diffuseColor = vec4(mix(wVolume, wFoamColour, waterFoam), 1.0);
}
`;
