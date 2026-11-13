/**
 * The water's own colour (the light scattered back out of it): pale and turquoise over the shallows, darker
 * over deep water, murkier in a pond, dimmer at night. Without the scene copy (phones) the water is blended
 * over the bed by depth: clear at the edge, solid further out. Foam is matt and white.
 */
export const WATER_FRAGMENT_COLOUR = /* glsl */ `
vec3 wDeepColour = diffuseColor.rgb;
float wShallow = 1.0 - smoothstep(0.0, 2.4, wDepth);
float wDeep = smoothstep(2.0, 8.0, wDepth);
float wDim = mix(1.0, 0.6, uWaterCalm) * mix(1.0, 0.5, uWaterNight);
vec3 wBody = mix(wDeepColour, uWaterShallow, wShallow * 0.6) * mix(1.0, 0.72, wDeep) * wDim;
// Foam is white, a shade greyer between its bubbles.
vec3 wFoamColour = vec3(mix(0.93, 0.7, uWaterNight) * mix(0.84, 1.0, wBubbles.g));
float wAlpha = mix(mix(diffuseColor.a, 0.4, wShallow), 1.0, wDeep * 0.5);
diffuseColor = vec4(mix(wBody, wFoamColour, waterFoam), mix(wAlpha, 1.0, waterFoam));
roughnessFactor = mix(roughnessFactor, 1.0, waterFoam);
#if NUM_DIR_LIGHTS > 0
vec3 wSunView = directionalLights[0].direction;
vec3 wSunColour = directionalLights[0].color;
#else
vec3 wSunView = vec3(0.0, 1.0, 0.0);
vec3 wSunColour = vec3(0.0);
#endif
vec3 wSun = (vec4(wSunView, 0.0) * viewMatrix).xyz;
`;
